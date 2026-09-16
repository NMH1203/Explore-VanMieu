# Chạy ứng dụng và sao lưu

Bản này dành cho bài thực hành hoặc một server nhỏ chạy một tiến trình Node. Không cần build frontend. API và frontend cùng origin; toàn bộ dữ liệu nằm trong SQLite và thư mục ảnh.

## Chạy trực tiếp

Theo README ở thư mục gốc. Biến `HOST=127.0.0.1` mặc định chỉ nghe trên máy hiện tại. Nếu đổi port, đổi cả `PORT` và `APP_ORIGIN`. Không thêm dấu `/` cuối origin.

Ảnh có thể được đặt thủ công vào `storage/location-images`, `storage/artifact-images`, `storage/user-avatars`, `storage/reward-assets`. API static chỉ phục vụ PNG/JPG/JPEG/WebP trong `/storage/`; không phục vụ HTML/SVG tại đây. Giao diện quản trị nhận URL ảnh HTTPS hoặc đường dẫn `/storage/...`; chưa có endpoint tải ảnh lên hoặc đổi avatar.

## Docker (cấu hình tùy chọn, chưa chạy thử trong môi trường tạo mã)

Chuẩn bị `.env` từ `.env.example`, sau đó:

```powershell
docker compose up --build -d
docker compose logs -f app
```

Mở `http://localhost:3000`. Các volume giữ database, backup và ảnh khi thay container.

Sau khi tự điền thông tin admin trong `.env`:

```powershell
docker compose run --rm app npm run admin:create
```

Chạy kiểm thử hoặc backup:

```powershell
docker compose run --rm app npm test
docker compose exec app npm run db:backup
```

Dừng bằng `docker compose down`. Không dùng `down -v` nếu cần giữ dữ liệu.

## Khi đưa lên server thật

- Dùng HTTPS ở reverse proxy và đặt `NODE_ENV=production`, `APP_ORIGIN=https://ten-mien-cua-ban`, `HOST=0.0.0.0` trong mạng nội bộ của proxy. Cookie sẽ có Secure.
- Trong production ứng dụng không tự seed dữ liệu, kể cả AUTO_SEED=true. Có thể chủ động chạy `npm run db:seed` nếu muốn dữ liệu thực hành, hoặc để admin nhập dữ liệu chính xác.
- Browser Geolocation cần secure context và quyền vị trí; ứng dụng hiện hỗ trợ localhost cho phát triển và HTTPS khi triển khai. Xem [tài liệu Geolocation của MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
- Giữ database trên ổ đĩa bền vững và định kỳ chạy backup. Không đặt backend này lên nền tảng chỉ phục vụ file tĩnh hoặc ổ đĩa tạm mất sau mỗi lần deploy.
- Rate limiter hiện lưu trong bộ nhớ của một tiến trình và dùng địa chỉ socket. Qua proxy, nhiều người có thể cùng IP; trước khi mở quy mô lớn cần rate limit tại proxy và cấu hình IP tin cậy phù hợp, không tin tùy tiện header X-Forwarded-For.
- Session hết hạn được dọn khi tạo phiên mới. Dữ liệu tọa độ check-in được lưu trong DB để phục vụ kiểm tra; nhóm nên quyết định thời hạn lưu phù hợp khi chuyển từ bài thực hành sang ứng dụng thật.

Đây là cấu hình để tự triển khai; trong tác vụ này chưa có website được xuất bản.

## Backup và khôi phục khi chạy trực tiếp

`npm run db:backup` dùng `VACUUM INTO` để tạo snapshot nhất quán ngay cả khi server đang hoạt động. File backup mới nằm trong `database/backups`, có thời gian trong tên.

Để khôi phục:

1. Dừng mọi tiến trình đang dùng database (kể cả server và công cụ xem SQLite).
2. Sao lưu toàn bộ `database/vanmieu.sqlite` và các file `vanmieu.sqlite-wal`, `vanmieu.sqlite-shm` nếu có vào một thư mục riêng.
3. Di chuyển bộ file hiện tại ra khỏi vị trí đang dùng, rồi copy file backup cần phục hồi vào `database/vanmieu.sqlite`. Không để WAL/SHM cũ đi kèm database được phục hồi.
4. Khởi động lại ứng dụng. Migration đã áp dụng được nhận diện từ bảng migrations; dữ liệu seed đã có sẽ không bị thêm đè.

Khôi phục làm dữ liệu quay về thời điểm backup, gồm cả trạng thái tài khoản, lượt ghé, phần thưởng và phiên. Dùng backup của cùng ứng dụng; giữ bản hiện tại để có thể quay lại nếu chọn sai snapshot.
