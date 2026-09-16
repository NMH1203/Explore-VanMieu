import { ensure } from '../utils/errors.js';

export function string(value, field, min = 1, max = 255, trim = true) {
  ensure(typeof value === 'string', 422, 'VALIDATION_ERROR', `${field} phải là chuỗi.`);
  const result = trim ? value.trim() : value;
  ensure(result.length >= min && result.length <= max, 422, 'VALIDATION_ERROR', `${field} phải dài ${min}–${max} ký tự.`);
  return result;
}
export const password = value => string(value, 'Mật khẩu', 10, 128, false);
export function email(value) {
  const result = string(value, 'Email', 3, 254).toLowerCase();
  ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result), 422, 'VALIDATION_ERROR', 'Email không hợp lệ.');
  return result;
}
export function number(value, field, min, max, integer = false) {
  ensure(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)), 422, 'VALIDATION_ERROR', `${field} phải là ${integer ? 'số nguyên' : 'số'} từ ${min} đến ${max}.`);
  return value;
}
export function boolean(value, field) {
  ensure(typeof value === 'boolean', 422, 'VALIDATION_ERROR', `${field} phải là true/false.`);
  return value ? 1 : 0;
}
export function oneOf(value, field, choices) {
  ensure(choices.includes(value), 422, 'VALIDATION_ERROR', `${field} phải là: ${choices.join(', ')}.`);
  return value;
}
export function imageUrl(value = '') {
  const result = string(value, 'Đường dẫn ảnh', 0, 1000);
  ensure(result === '' || /^https:\/\/[^\s]+$/i.test(result) || /^\/storage\/[a-zA-Z0-9_./-]+$/.test(result), 422, 'VALIDATION_ERROR', 'Ảnh phải dùng HTTPS hoặc /storage/…');
  return result;
}
export function locationInput(body) {
  const slug = string(body.slug, 'Slug', 2, 100);
  ensure(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), 422, 'VALIDATION_ERROR', 'Slug chỉ dùng chữ thường không dấu, số và dấu gạch ngang.');
  return {
    name: string(body.name, 'Tên', 2, 120), slug,
    description: string(body.description, 'Mô tả', 1, 1500),
    story: string(body.story, 'Nội dung', 1, 20000),
    latitude: number(body.latitude, 'Vĩ độ', -90, 90),
    longitude: number(body.longitude, 'Kinh độ', -180, 180),
    radius_meters: number(body.radiusMeters ?? 60, 'Bán kính', 10, 300, true),
    stamp_icon: string(body.stampIcon ?? '★', 'Biểu tượng', 1, 12),
    image_url: imageUrl(body.imageUrl),
    sort_order: number(body.sortOrder ?? 0, 'Thứ tự', 0, 10000, true),
    is_active: boolean(body.isActive ?? true, 'Hiển thị'),
  };
}
export function artifactInput(body) {
  return { location_id: string(body.locationId, 'Địa điểm', 1, 100), name: string(body.name, 'Tên', 2, 120), description: string(body.description, 'Mô tả', 1, 10000), period: string(body.period ?? '', 'Niên đại', 0, 150), image_url: imageUrl(body.imageUrl), is_active: boolean(body.isActive ?? true, 'Hiển thị') };
}
export function rewardInput(body) {
  return { name: string(body.name, 'Tên', 2, 120), description: string(body.description, 'Mô tả', 1, 2000), threshold: number(body.threshold, 'Số dấu cần đạt', 1, 10000, true), kind: oneOf(body.kind, 'Loại', ['badge', 'digital', 'physical']), stock: body.stock == null ? null : number(body.stock, 'Tồn kho', 0, 1000000, true), is_active: boolean(body.isActive ?? true, 'Hiển thị') };
}
export function pagination(query) {
  const page = Number(query.get('page') ?? 1);
  const limit = Number(query.get('limit') ?? 20);
  number(page, 'Trang', 1, 100000, true); number(limit, 'Kích thước trang', 1, 100, true);
  return { page, limit, offset: (page - 1) * limit };
}
