# Hướng dẫn Khởi chạy Dự án Explore Van Mieu (Dành cho Linux / Ubuntu)

Tài liệu này tổng hợp toàn bộ các câu lệnh cần thiết để cài đặt, khởi tạo database và khởi chạy hệ thống (Frontend + Backend) trên máy tính của bạn.

---

## 1. Cài đặt ban đầu (Chỉ cần làm 1 lần khi mới clone dự án)

Mở Terminal tại thư mục gốc của dự án (`/home/minhluong/Documents/VanMieu/Explore-VanMieu`):

### 1.1. Cài đặt Backend & Môi trường ảo Python
```bash
# Tạo môi trường ảo venv
python3 -m venv backend/.venv

# Cài đặt toàn bộ thư viện từ requirements.txt
backend/.venv/bin/pip install -r backend/requirements.txt
```

### 1.2. Cài đặt Frontend (Node.js)
```bash
cd frontend
npm install
cd ..
```

### 1.3. Khởi tạo Database SQLite & Dữ liệu mẫu
```bash
# Tạo bảng cơ sở dữ liệu
backend/.venv/bin/python -m database.schema.init_db

# Nạp dữ liệu 10 địa điểm di tích Văn Miếu
backend/.venv/bin/python -m database.seeds.seed_locations

# Tạo tài khoản quản trị mẫu
backend/.venv/bin/python -m database.seeds.seed_demo_admin
```

> 🔑 **Tài khoản quản trị (Admin) mặc định:**
> - **Email**: `root@example.com`
> - **Mật khẩu**: `RootTest123!`

---

## 2. Các câu lệnh chạy dự án hàng ngày

Mỗi khi mở máy lên để code hoặc chạy demo, bạn mở **2 cửa sổ Terminal** cạnh nhau:

### 🖥️ TERMINAL 1: Chạy Backend (FastAPI - Cổng 8000)
Đứng từ thư mục gốc dự án:
```bash
backend/.venv/bin/python -m uvicorn backend.src.app.main:app --reload --port 8000
```
*(Giữ nguyên terminal này chạy. Khi muốn dừng thì bấm `Ctrl + C`)*.

---

### 🌐 TERMINAL 2: Chạy Frontend (React Vite - Cổng 5173)
Đứng từ thư mục gốc dự án:
```bash
cd frontend
npm run dev
```
*(Giữ nguyên terminal này chạy. Khi muốn dừng thì bấm `Ctrl + C`)*.

---

## 3. Các đường link truy cập trên Trình duyệt

Khi cả 2 Terminal đang chạy, bạn mở trình duyệt web lên:

| Trang | Đường dẫn (URL) | Mô tả |
| :--- | :--- | :--- |
| **Trang chủ Khám phá** | [http://localhost:5173](http://localhost:5173) | Xem tổng quan, danh nhân, di tích |
| **Bản đồ Di tích** | [http://localhost:5173/Explore/Ban-Do](http://localhost:5173/Explore/Ban-Do) | Bản đồ Leaflet định vị 10 điểm GPS |
| **Camera Nhận diện** | [http://localhost:5173/Explore/Camera](http://localhost:5173/Explore/Camera) | Quét ảnh, check-in, đổi camera |
| **Hộ chiếu Di sản** | [http://localhost:5173/Explore/Ho-Chieu](http://localhost:5173/Explore/Ho-Chieu) | Xem bộ sưu tập con dấu đã mở khóa |
| **Đăng nhập** | [http://localhost:5173/Explore/Dang-Nhap](http://localhost:5173/Explore/Dang-Nhap) | Đăng nhập tài khoản |
| **Đăng ký** | [http://localhost:5173/Explore/Dang-Ky](http://localhost:5173/Explore/Dang-Ky) | Tạo tài khoản mới lưu vào DB |
| **Tài liệu API Backend** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI để test trực tiếp các API |

---

## 4. Các câu lệnh Kiểm thử (Testing) & Đóng gói (Build)

Dùng để kiểm tra xem hệ thống có bị lỗi code hay không:

### 4.1. Kiểm thử Backend (14 bài test tự động)
Chạy từ thư mục gốc:
```bash
backend/.venv/bin/python -m unittest discover -s backend/tests
```

### 4.2. Kiểm thử Frontend
Chạy từ thư mục `frontend`:
```bash
cd frontend
npm test
```

### 4.3. Đóng gói sản phẩm (Build kiểm tra lỗi biên dịch)
Chạy từ thư mục `frontend`:
```bash
cd frontend
npm run build
```
