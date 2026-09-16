# Cơ sở dữ liệu

Database SQLite được tạo ở `database/vanmieu.sqlite`, có thể đổi bằng `DATABASE_PATH` trong `.env`. Đường dẫn tương đối luôn tính từ thư mục gốc dự án, không phụ thuộc terminal đang đứng ở đâu.

Schema chuẩn: [`../../database/migrations/001_initial.sql`](../../database/migrations/001_initial.sql). Bảng `migrations` ghi các file SQL đã chạy; khi thêm tính năng, tạo migration mới `002_...sql`, không chỉnh migration đã áp dụng trên database của người dùng.

| Bảng | Mục đích | Ràng buộc quan trọng |
| --- | --- | --- |
| `users` | Tài khoản, tên, email, password hash, role/status | Email UNIQUE NOCASE; role visitor/admin |
| `sessions` | Phiên, CSRF token, hạn dùng | Chỉ lưu SHA-256 của session token; FK user |
| `locations` | Địa điểm, tọa độ, bán kính, mô tả, câu chuyện | Slug duy nhất; tọa độ/bán kính có CHECK |
| `artifacts` | Hiện vật thuộc địa điểm | FK location; ẩn/hiện độc lập |
| `check_ins` | Các lượt ghé có vị trí, sai số và thời gian GPS | UNIQUE(user_id, location_id, visit_date) |
| `stamps` | Con dấu đầu tiên của mỗi người tại địa điểm | PK(user_id, location_id); FK check-in đầu tiên |
| `journeys` | Hành trình của một người trong một ngày | UNIQUE(user_id, visit_date) |
| `journey_stops` | Các điểm và thứ tự trong hành trình | Không trùng địa điểm/thứ tự trong cùng journey |
| `rewards` | Cột mốc, loại phần thưởng, tồn kho | Threshold >=1; stock NULL hoặc >=0 |
| `reward_claims` | Lượt nhận và mã nhận phần thưởng | UNIQUE(user_id, reward_id); code duy nhất |
| `audit_logs` | Ai thay đổi loại bản ghi nào, vào lúc nào | FK actor; không lưu mật khẩu hay session |
| `app_meta` | Ghi nhận seed đã chạy và ghi chú dữ liệu mẫu | Key duy nhất |
| `migrations` | Lịch sử thay đổi schema | Tên migration duy nhất |

Quan hệ chính: users có nhiều sessions/check_ins/stamps/journeys/reward_claims; locations có nhiều artifacts/check_ins/stamps; mỗi journey có các journey_stops; mỗi reward có nhiều reward_claims. Phần thưởng và địa điểm được ẩn thay vì xóa cứng để bảo toàn lịch sử.

## Giao dịch và tính đúng đắn

`PRAGMA foreign_keys=ON`, `journal_mode=WAL`, `busy_timeout=5000` được áp dụng khi mở DB. Check-in + con dấu là một transaction. Kiểm tra điều kiện + trừ tồn kho + tạo lượt nhận là một transaction `BEGIN IMMEDIATE`. Ràng buộc UNIQUE là lớp bảo vệ cuối cùng cho các thao tác trùng.

Thời gian sự kiện lưu ISO UTC. `visit_date` được tính phía server theo `Asia/Ho_Chi_Minh`. Con dấu được giữ trọn đời; check-in theo ngày để lưu lần quay lại. Khi ẩn địa điểm, danh sách công khai bỏ địa điểm đó; passport vẫn trả con dấu đã thu thập và hành trình hôm nay thay điểm bị ẩn bằng điểm đang hoạt động nếu còn.

Phần thưởng lưu snapshot `reward_name` và `reward_kind` lúc nhận để việc sửa danh mục không đổi lịch sử đã cấp. `physical` tạo claim `pending`; huy hiệu/danh hiệu tạo claim `fulfilled`. Admin chỉ chuyển claim sang `fulfilled`, không có cơ chế hoàn tác phát quà hoặc trả tồn kho trong phiên bản này.

## Xem dữ liệu

Có thể dùng ứng dụng xem SQLite hoặc extension SQLite trong VS Code để mở file `.sqlite`. Không import schema SQLite này vào MySQL Workbench: hai hệ quản trị có cú pháp/kiểu dữ liệu khác nhau.

Một số query đọc dữ liệu:

```sql
SELECT name, email, role, status FROM users;

SELECT u.name AS visitor, l.name AS location, c.visit_date, c.created_at
FROM check_ins c
JOIN users u ON u.id = c.user_id
JOIN locations l ON l.id = c.location_id
ORDER BY c.created_at DESC;

SELECT u.name, COUNT(*) AS collected_stamps
FROM stamps s JOIN users u ON u.id = s.user_id
GROUP BY u.id, u.name;

SELECT reward_name, claim_code, status, claimed_at, fulfilled_at
FROM reward_claims ORDER BY claimed_at DESC;
```

Chạy `npm run db:backup` để tạo snapshot nhất quán. Không chỉ copy riêng file `.sqlite` khi server đang ghi dữ liệu: các thay đổi mới có thể còn trong WAL. Xem tài liệu deployment để khôi phục an toàn.
