# API Explore Van Mieu

Base URL khi chạy trên máy: `http://localhost:3000/api`.

Kết quả thành công: `{ "data": ... }`. Lỗi: `{ "error": { "code": "...", "message": "...", "details": {}, "requestId": "..." } }`; `details` chỉ xuất hiện khi có thông tin bổ sung.

Danh sách phân trang: `{ "data": { "items": [], "pagination": { "page": 1, "limit": 20, "total": 10, "pages": 1 } } }`. Query `page >= 1`, `1 <= limit <= 100`. `GET /rewards` trả mảng; `GET /passport` và `/journeys/today` trả object tổng hợp.

## Xác thực

Sau đăng ký/đăng nhập, server đặt cookie `vm_session` (HttpOnly, SameSite=Strict; Secure trong production) và trả `csrfToken`. Frontend giữ CSRF token trong bộ nhớ; sau tải lại trang lấy bằng `GET /auth/session`. Cookie được browser tự gửi cùng request.

Mọi API ghi dữ liệu có yêu cầu đăng nhập cần header **`X-CSRF-Token`**. Mọi POST/PUT/PATCH/DELETE, kể cả đăng xuất, nhận **JSON object** với `Content-Type: application/json`; dùng `{}` khi không có trường dữ liệu. Giới hạn body 64 KB. Server không mở CORS; frontend được phục vụ cùng origin.

## Endpoint

| Method | Path | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/health` | Công khai | Kiểm tra server và database |
| GET | `/config` | Công khai | Quy tắc GPS và trạng thái camera/AI/dữ liệu mẫu |
| POST | `/auth/register` | Công khai | `{name,email,password}`; luôn tạo `visitor` |
| POST | `/auth/login` | Công khai | `{email,password}` |
| GET | `/auth/session` | Công khai | `{user,csrfToken,expiresAt}`; không có phiên thì các trường null |
| POST | `/auth/logout` | Đăng nhập | `{}`; hủy phiên hiện tại |
| GET | `/users/me` | Đăng nhập | Thông tin tài khoản hiện tại |
| PATCH | `/users/me` | Đăng nhập | `{name}` |
| PATCH | `/users/me/password` | Đăng nhập | `{currentPassword,newPassword}`; thu hồi mọi phiên |
| GET | `/locations` | Công khai | `search`, `latitude`, `longitude`, `page`, `limit` |
| GET | `/locations/:id` | Công khai | Chấp nhận ID hoặc slug; story=null khi chưa mở khóa |
| GET | `/artifacts` | Công khai | `locationId`, `page`, `limit` |
| GET | `/artifacts/:id` | Công khai | Chi tiết hiện vật đang hiển thị |
| POST | `/check-ins` | Đăng nhập | Gửi vị trí GPS để ghi nhận lượt ghé |
| GET | `/check-ins` | Đăng nhập | Lịch sử của chính tài khoản; `page`, `limit` |
| GET | `/passport` | Đăng nhập | Con dấu, số lượt ghé, cột mốc, trạng thái bảng màu |
| GET | `/journeys/today` | Đăng nhập | Hành trình theo ngày Việt Nam, tối đa 5 điểm |
| GET | `/rewards` | Công khai | Thưởng và tiến trình người hiện tại nếu đăng nhập |
| POST | `/rewards/:id/claim` | Đăng nhập | `{}`; nhận phần thưởng, trả mã nhận |
| GET | `/admin/stats` | Admin | Số liệu tổng hợp |
| GET | `/admin/locations` | Admin | Tất cả địa điểm kể cả đã ẩn; có story |
| POST | `/admin/locations` | Admin | Tạo địa điểm |
| PUT | `/admin/locations/:id` | Admin | Thay nội dung cấu hình đầy đủ của địa điểm |
| DELETE | `/admin/locations/:id` | Admin | `{}`; ẩn địa điểm |
| GET | `/admin/artifacts` | Admin | Hiện vật kể cả đã ẩn |
| POST | `/admin/artifacts` | Admin | Tạo hiện vật |
| PUT | `/admin/artifacts/:id` | Admin | Thay nội dung hiện vật |
| DELETE | `/admin/artifacts/:id` | Admin | `{}`; ẩn hiện vật |
| GET | `/admin/rewards` | Admin | Tất cả phần thưởng |
| POST | `/admin/rewards` | Admin | Tạo phần thưởng |
| PUT | `/admin/rewards/:id` | Admin | Thay cấu hình phần thưởng |
| DELETE | `/admin/rewards/:id` | Admin | `{}`; ngừng phát hành |
| GET | `/admin/users` | Admin | `search`, `page`, `limit`; không trả password hash |
| PATCH | `/admin/users/:id` | Admin | Một hoặc nhiều trường `{name,role,status}` |
| GET | `/admin/claims` | Admin | Danh sách lượt nhận thưởng |
| PATCH | `/admin/claims/:id` | Admin | `{status:"fulfilled"}`; đánh dấu đã trao |
| GET | `/admin/audit` | Admin | Nhật ký thay đổi quản trị |

Các danh sách admin nhận `page`, `limit`; thứ tự mới trước. Địa điểm công khai mặc định theo `sortOrder`; có tọa độ thì theo khoảng cách tăng dần. Phạm vi GPS tính trên số thực trước khi làm tròn khoảng cách hiển thị.

## Body ví dụ

Tạo/sửa địa điểm — PUT gửi đầy đủ các trường cần giữ:

```json
{
  "name": "Khuê Văn Các",
  "slug": "khue-van-cac",
  "description": "Giới thiệu ngắn",
  "story": "Câu chuyện đầy đủ, lưu dạng văn bản thuần.",
  "latitude": 21.02654,
  "longitude": 105.83589,
  "radiusMeters": 60,
  "stampIcon": "★",
  "imageUrl": "",
  "sortOrder": 2,
  "isActive": true
}
```

Tạo/sửa hiện vật:

```json
{
  "name": "Hồ sơ hiện vật mẫu",
  "locationId": "loc-nha-thai-hoc",
  "description": "Nội dung giới thiệu",
  "period": "Chưa cập nhật",
  "imageUrl": "",
  "isActive": true
}
```

Tạo/sửa phần thưởng:

```json
{
  "name": "Quà tại quầy",
  "description": "Nhận khi có ba con dấu khác nhau",
  "threshold": 3,
  "kind": "physical",
  "stock": 20,
  "isActive": true
}
```

`kind`: `badge`, `digital`, `physical`. `stock: null` là không giới hạn; `0` là hết hàng. Stock chỉ trừ khi tạo lượt nhận mới. Mốc dùng tổng con dấu trọn đời, không dùng số lần bấm hoặc số lượt ghé lặp lại. Đã nhận thì giữ mã nhận dù admin ẩn/sửa phần thưởng. Claim lưu snapshot tên và loại phần thưởng tại lúc nhận.

Check-in:

```json
{
  "locationId": "loc-khue-van-cac",
  "latitude": 21.02654,
  "longitude": 105.83589,
  "accuracy": 8,
  "observedAt": "THAY_BANG_THOI_GIAN_ISO_UTC_HIEN_TAI"
}
```

Frontend dùng `new Date(position.timestamp).toISOString()`. Server chấp nhận tối đa 10 giây lệch về tương lai và 120 giây về quá khứ theo cấu hình mặc định. Sai số GPS không cộng vào bán kính để vượt điều kiện khoảng cách.

## Thử bằng PowerShell, tránh lỗi dấu nháy JSON của curl.exe

Chạy `npm.cmd start` ở terminal thứ nhất. Tại terminal thứ hai:

```powershell
$apiBase = 'http://localhost:3000/api'
$vmSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Đăng ký tài khoản thử; nếu email đã tồn tại, đổi email hoặc gọi /auth/login.
$registration = @{
    name = 'Nguoi dung thu'
    email = 'visitor-test@example.com'
    password = 'MatKhauThuNghiem-123!'
} | ConvertTo-Json

$authResult = Invoke-RestMethod -Method Post -Uri "$apiBase/auth/register" `
    -ContentType 'application/json; charset=utf-8' `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($registration)) -WebSession $vmSession

$vmHeaders = @{ 'X-CSRF-Token' = $authResult.data.csrfToken }

$locations = Invoke-RestMethod -Uri "$apiBase/locations" -WebSession $vmSession
$locations.data.items | Format-Table id, name, radiusMeters

# Vị trí minh họa của Khuê Văn Các để kiểm thử API.
$checkInBody = @{
    locationId = 'loc-khue-van-cac'
    latitude = 21.02654
    longitude = 105.83589
    accuracy = 8
    observedAt = [DateTime]::UtcNow.ToString('o')
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "$apiBase/check-ins" `
    -WebSession $vmSession -Headers $vmHeaders `
    -ContentType 'application/json' -Body $checkInBody

$passport = Invoke-RestMethod -Uri "$apiBase/passport" -WebSession $vmSession
$passport.data | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method Post -Uri "$apiBase/rewards/reward-first-step/claim" `
    -WebSession $vmSession -Headers $vmHeaders `
    -ContentType 'application/json' -Body '{}'

Invoke-RestMethod -Method Post -Uri "$apiBase/auth/logout" `
    -WebSession $vmSession -Headers $vmHeaders `
    -ContentType 'application/json' -Body '{}'
```

Tài khoản trên chỉ là ví dụ kiểm thử cục bộ, không được tự tạo sẵn trong bản phân phối. Để gửi tên/nội dung tiếng Việt từ Windows PowerShell 5, chuyển JSON thành UTF-8 bytes như bước đăng ký.

## Mã lỗi chính

| HTTP | Code ví dụ | Ý nghĩa |
| --- | --- | --- |
| 400 | `INVALID_JSON` | JSON không parse được hoặc không phải object |
| 401 | `AUTH_REQUIRED`, `INVALID_CREDENTIALS` | Thiếu phiên hoặc đăng nhập sai |
| 403 | `ADMIN_REQUIRED`, `CSRF_INVALID`, `ORIGIN_DENIED` | Không đủ quyền / token / origin |
| 403 | `OUT_OF_RANGE`, `MILESTONE_NOT_REACHED` | Chưa đủ điều kiện nghiệp vụ |
| 404 | `LOCATION_NOT_FOUND`, `NOT_FOUND` | Không có tài nguyên đang hoạt động |
| 409 | `EMAIL_EXISTS`, `SLUG_EXISTS`, `OUT_OF_STOCK`, `SELF_LOCKOUT` | Xung đột dữ liệu |
| 413 | `BODY_TOO_LARGE` | Body vượt 64 KB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Thiếu `application/json` |
| 422 | `VALIDATION_ERROR`, `LOW_GPS_ACCURACY`, `STALE_POSITION` | Giá trị đầu vào không hợp lệ |
| 429 | `RATE_LIMITED` | Vượt hạn mức; xem `Retry-After` |
| 500 | `INTERNAL_ERROR` | Lỗi server, dùng requestId để tra log |
