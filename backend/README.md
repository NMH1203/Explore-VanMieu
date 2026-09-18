# 📁 Explore Van Mieu - Backend API (FastAPI)

Đây là toàn bộ mã nguồn Backend của dự án **Explore Van Mieu**, được xây dựng bằng framework **FastAPI (Python)**. Hệ thống cung cấp các API xử lý dữ liệu động, cơ sở dữ liệu thật (SQLite), xác thực người dùng bảo mật và logic tính toán tọa độ di sản.

---

## 🚀 Hướng dẫn Setup và Chạy Backend dưới máy Local

Khi các thành viên kéo nhánh `feature/backendwed` này về, hãy làm theo các bước sau để khởi động Server Backend cổng `8000`:

### Bước 1: Di chuyển vào thư mục backend
Mở terminal tại thư mục gốc của dự án và gõ:
```bash
cd backend
```

### Bước 2: Khởi tạo môi trường ảo Python (venv)
Mỗi máy cần tự khởi tạo môi trường ảo riêng (Thư mục venv đã được đưa vào `.gitignore` nên không có sẵn trên Git):
```bash
# Lệnh tạo môi trường ảo
python -m venv venv
```

### Bước 3: Kích hoạt môi trường ảo (Activate)
* **Trên Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(Nếu bị chặn bảo mật script trên Windows, chạy lệnh này trước: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`)*
* **Trên macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```
👉 **Dấu hiệu thành công:** Đầu dòng lệnh xuất hiện chữ màu xanh `(venv)`.

### Bước 4: Cài đặt các thư viện cần thiết
```bash
pip install -r requirements.txt
```

### Bước 5: Khởi chạy Server Uvicorn
```bash
uvicorn src.app.main:app --reload
```
Server Backend sẽ chính thức hoạt động tại địa chỉ: `http://127.0.0.1:8000`

---

## 🛠️ Trang Tài liệu & Chạy thử API (Swagger UI)

FastAPI hỗ trợ trang quản lý và test API cực kỳ trực quan. Sau khi bật server thành công, mọi người hãy truy cập đường link sau trên trình duyệt để xem tài liệu cấu trúc dữ liệu:
👉 **`http://localhost:8000/docs#/**

### 🔐 Quy trình Test các chức năng Bảo mật (Có ổ khóa 🔒)
Hệ thống sử dụng bảo mật mã hóa **JWT Bearer Token** cho các tính năng Check-in và Hộ chiếu. Để test trên Swagger UI:
1. Vào mục **`POST /api/v1/auth/register`** để tạo một tài khoản mới.
2. Xuống mục **`POST /api/v1/auth/login`**, nhập tài khoản vừa tạo -> Bấm *Execute* -> Copy chuỗi mã dài nằm trong ô `access_token`.
3. Cuộn lên đầu trang Swagger, bấm vào nút **`Authorize`** màu xám 🔓 -> Dán chuỗi token vừa copy vào ô **Value** -> Bấm **Authorize** -> Biểu tượng ổ khóa đóng lại 🔐.
4. Bây giờ,  có thể test thoải mái các API thuộc nhóm `/checkin` và `/passport`.

---

## 🗺️ Bản đồ danh mục API phục vụ các Trang Frontend

| Nhóm API Endpoints | Loại | Chức năng nghiệp vụ liên kết Frontend | Bảo mật (Token) |
| :--- | :--- | :--- | :---: |
| `/api/v1/auth/register` | `POST` | Đăng ký tài khoản du khách | ❌ Không |
| `/api/v1/auth/login` | `POST` | Đăng nhập tài khoản (Cấp Access Token) | ❌ Không |
| `/api/v1/locations/` | `GET` | Lấy danh sách tất cả các cổng, di tích Văn Miếu | ❌ Không |
| `/api/v1/locations/{id}`| `GET` | Xem chi tiết di tích và các Hiện vật con nằm bên trong | ❌ Không |
| `/api/v1/figures/` | `GET` | Lấy danh sách tiểu sử Danh nhân khoa bảng (Chu Văn An...) | ❌ Không |
| `/api/v1/checkin/verify-gps` | `POST`| Gửi tọa độ GPS người dùng. Tự động đóng dấu Hộ chiếu số nếu khoảng cách đến di tích `< 50m` |  Có |
| `/api/v1/passport/stamps` | `GET` | Lấy danh sách trạng thái con dấu (Sáng/Tối) của du khách |  Có |

---

## 🗄️ Cấu trúc Cơ sở dữ liệu thật (Database)
Hệ thống sử dụng **SQLite** (`explore_vanmieu.db`). File database sẽ **tự động sinh ra** ngay khi server Backend khởi động lần đầu tiên.

