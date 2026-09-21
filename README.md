# Explore Van Mieu

Explore Van Mieu là ứng dụng web hỗ trợ du khách khám phá Văn Miếu và các địa điểm di sản theo cách trực quan, chủ động và có tính tương tác cao. Người dùng có thể xem bản đồ, xác định vị trí, chụp ảnh hiện vật, nhận nội dung thuyết minh bằng AI, check-in và sưu tầm con dấu trong hộ chiếu di sản số.

Ứng dụng được định hướng phát triển dưới dạng Web App hoặc Progressive Web App để có thể hoạt động trên điện thoại, máy tính bảng và máy tính thông qua trình duyệt.

## 1. Giới thiệu dự án

### 1.1 Bài toán

Tại nhiều khu di tích, du khách phải tìm các bảng QR, trạm NFC hoặc bảng giới thiệu được đặt ngoài trời. Cách làm này có một số hạn chế:

- Bảng check-in có thể khó tìm, bị che khuất hoặc hư hỏng.
- Thiết bị ngoài trời cần chi phí lắp đặt, bảo trì và thay thế.
- Các bảng vật lý có thể ảnh hưởng đến cảnh quan của khu di tích.
- Nội dung giới thiệu thường ngắn và cố định.
- Du khách không thể đặt thêm câu hỏi về địa điểm hoặc hiện vật.
- Việc chỉ đọc nội dung dài dễ tạo cảm giác thụ động và nhàm chán.

### 1.2 Giải pháp

Explore Van Mieu sử dụng GPS kết hợp với nhận diện hình ảnh để tạo quy trình check-in hai lớp:

1. Hệ thống kiểm tra người dùng có đang ở trong phạm vi cho phép của địa điểm hay không.
2. Người dùng chụp ảnh hiện vật bằng camera trên điện thoại.
3. Mô hình nhận diện hình ảnh kiểm tra hiện vật trong ảnh.
4. Khi thông tin vị trí và hình ảnh đều hợp lệ, lượt tham quan được xác nhận.
5. Hệ thống thêm con dấu vào hộ chiếu di sản số của người dùng.

Sau khi nhận diện hiện vật, hệ thống AI có thể cung cấp phần thuyết minh ngắn gọn về lịch sử, kiến trúc và ý nghĩa văn hóa. Người dùng cũng có thể đặt câu hỏi để tìm hiểu thêm về nội dung mình quan tâm.

## 2. Công nghệ dự kiến

### Frontend

- React
- React DOM
- Vite
- JavaScript và JSX
- CSS responsive
- Web App hoặc Progressive Web App

### Backend

Backend dự kiến được phát triển bằng Python. FastAPI là framework phù hợp để xây dựng API vì có cấu trúc rõ ràng, hỗ trợ kiểm tra dữ liệu và tự động tạo tài liệu API.

Các công nghệ backend dự kiến gồm:

- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- Alembic
- Pytest

Backend hiện đã có API quản lý tiến độ địa điểm và xác thực người dùng bằng
FastAPI, SQLModel, SQLite, Argon2 và JWT lưu trong cookie `HttpOnly`.

### AI

- YOLOv8 hoặc YOLOv11 để nhận diện hiện vật.
- PyTorch để huấn luyện hoặc tinh chỉnh mô hình.
- TensorRT để tối ưu mô hình khi triển khai trên thiết bị phù hợp.
- Qwen, Gemma hoặc mô hình ngôn ngữ tương tự để tạo nội dung thuyết minh.
- Ollama để chạy mô hình ngôn ngữ cục bộ nếu cần.

Các thư viện AI sẽ được cài đặt sau khi nhóm thống nhất mô hình và thiết bị triển khai.

Trong giai đoạn demo, backend gọi API nhận diện ảnh tương thích OpenAI của
YEScale. Khóa API chỉ nằm trong file `.env` của backend; frontend không được
nhận hoặc lưu khóa này. YOLO có thể thay thế lớp dịch vụ này trong giai đoạn sau.

### Cơ sở dữ liệu

Cơ sở dữ liệu dự kiến lưu trữ:

- Thông tin người dùng.
- Thông tin địa điểm và tọa độ GPS.
- Thông tin di tích và hiện vật.
- Hình ảnh tham chiếu của hiện vật.
- Lịch sử tham quan và check-in.
- Con dấu trong hộ chiếu di sản.
- Điều kiện hoàn thành cột mốc.
- Phần thưởng và trạng thái đổi thưởng.

## 3. Cấu trúc thư mục

```text
Explore VanMieu/
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── locations/
│   │   │   ├── artifacts/
│   │   │   └── rewards/
│   │   ├── icons/
│   │   └── fonts/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── config/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── utils/
│   │   └── app/
│   └── tests/
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── schema/
│   └── backups/
├── storage/
│   ├── location-images/
│   ├── artifact-images/
│   ├── user-avatars/
│   └── reward-assets/
├── tests/
│   ├── frontend/
│   ├── backend/
│   └── integration/
├── docs/
│   ├── api/
│   ├── database/
│   ├── diagrams/
│   ├── requirements/
│   └── deployment/
└── deployment/
    ├── docker/
    ├── nginx/
    └── scripts/
```

### Chức năng của các thư mục chính

| Thư mục | Chức năng |
| --- | --- |
| `frontend` | Chứa giao diện React và các chức năng tương tác với người dùng. |
| `backend` | Chứa API, xử lý nghiệp vụ, xác thực và kết nối với hệ thống AI. |
| `database` | Chứa migration, dữ liệu mẫu, schema và bản sao lưu cơ sở dữ liệu. |
| `storage` | Lưu hình ảnh địa điểm, hiện vật, ảnh đại diện và tài nguyên phần thưởng. |
| `tests` | Chứa các bài kiểm thử frontend, backend và kiểm thử tích hợp. |
| `docs` | Chứa tài liệu API, cơ sở dữ liệu, sơ đồ và yêu cầu dự án. |
| `deployment` | Chứa cấu hình Docker, Nginx và các script triển khai. |

## 4. Cài đặt và chạy dự án

Các lệnh bên dưới được chạy từ thư mục gốc của repository, nơi có các thư mục
`backend`, `database` và `frontend`.

### 4.1 Yêu cầu

- Node.js phiên bản 18 trở lên.
- npm.
- Python phiên bản 3.12 trở lên.
- Git.

Kiểm tra các công cụ đã được cài:

```powershell
git --version
node --version
npm --version
python --version
```

### 4.2 Lấy mã nguồn

```powershell
git clone https://github.com/NMH1203/Explore-VanMieu.git
cd Explore-VanMieu
```

Nếu đã clone dự án từ trước:

```powershell
git switch main
git pull origin main
```

### 4.3 Cài đặt backend

Tạo môi trường Python riêng và cài thư viện:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Tạo file cấu hình cá nhân từ file mẫu:

```powershell
Copy-Item .env.example .env
```

Mở `.env` và thay giá trị mẫu bằng một chuỗi bí mật riêng:

```env
JWT_SECRET_KEY=chuoi_bi_mat_ngau_nhien_cua_ban
YESCALE_API_KEY=api_key_yescale_cua_ban
YESCALE_BASE_URL=https://api.yescale.io/v1
YESCALE_VISION_MODEL=gpt-4o-mini
YESCALE_MIN_CONFIDENCE=0.70
```

Có thể tạo một chuỗi ngẫu nhiên bằng lệnh:

```powershell
backend\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(64))"
```

Không commit file `.env`. File này đã được khai báo trong `.gitignore`.

Tạo database SQLite, toàn bộ các bảng và dữ liệu mẫu của 10 địa điểm:

```powershell
backend\.venv\Scripts\python.exe -m database.init_db
backend\.venv\Scripts\python.exe -m database.seed_locations
```

Khởi động backend:

```powershell
backend\.venv\Scripts\python.exe -m uvicorn backend.src.app.main:app --reload --port 8000
```

Khi terminal hiện `Application startup complete`, mở tài liệu API tại:

```text
http://127.0.0.1:8000/docs
```

Giữ terminal backend đang chạy trong khi sử dụng website.

> Các lệnh backend phải chạy từ thư mục gốc. Nếu đang đứng trong thư mục
> `backend`, hãy chạy `cd ..` trước.

### 4.4 Cài đặt frontend

Mở terminal thứ hai và chạy:

```powershell
cd frontend
npm install
```

### 4.5 Chạy môi trường phát triển

```powershell
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập trong terminal. Địa chỉ mặc định thường là:

```text
http://localhost:5173
```

Trang đăng nhập/đăng ký:

```text
http://localhost:5173/Explore/Dang-Nhap
```

Frontend gọi các đường dẫn `/api/...`; Vite sẽ chuyển tiếp yêu cầu đến backend
đang chạy tại `http://127.0.0.1:8000`.

### 4.6 Kiểm tra dự án

Chạy test backend từ thư mục gốc:

```powershell
backend\.venv\Scripts\python.exe -m unittest discover -s backend/tests
```

Kiểm tra frontend có build thành công:

```powershell
cd frontend
npm run build
cd ..
```

### 4.7 Thử luồng đăng nhập

1. Mở trang đăng nhập và chọn **Đăng ký**.
2. Nhập họ tên, email và mật khẩu có ít nhất 8 ký tự.
3. Đăng nhập bằng tài khoản vừa tạo.
4. Tải lại trang để kiểm tra phiên đăng nhập được giữ bằng cookie.
5. Bấm **Đăng xuất** và tải lại trang để kiểm tra phiên đã bị xóa.

### 4.8 Thử check-in bằng GPS và AI

1. Điền `YESCALE_API_KEY` trong `.env`, rồi khởi động lại backend.
2. Đăng nhập và mở trang **Camera** bằng điện thoại hoặc trình duyệt có camera.
3. Cho phép trang web truy cập camera và vị trí GPS.
4. Chọn địa điểm gần nhất, hướng camera vào công trình rồi bấm **Bắt đầu quét**.
5. Backend kiểm tra khoảng cách trước để tránh gọi AI tốn phí khi người dùng ở xa.
6. Nếu GPS nằm trong bán kính và nhãn ảnh khớp với địa điểm, backend ghi
   `checkin_logs`, cập nhật `user_history` và frontend hiển thị con dấu.

Ảnh được gửi thẳng đến YEScale để phân tích và hiện chưa được lưu xuống ổ đĩa.
Giá trị `YESCALE_VISION_MODEL` phải là model có khả năng nhận ảnh đang được tài
khoản YEScale hỗ trợ. Nếu dashboard không có `gpt-4o-mini`, hãy thay bằng tên
model vision hiển thị trên dashboard.

SQLite được dùng cho môi trường phát triển. Mỗi máy có file
`database/explore_van_mieu.db` riêng, nên tài khoản không tự đồng bộ giữa các
thành viên.

### 4.9 Tạo và xem bản build production

```powershell
cd frontend
npm run build
npm run preview
```

### 4.10 Lỗi thường gặp

#### `No module named backend`

Bạn đang chạy lệnh trong sai thư mục. Quay về thư mục gốc:

```powershell
cd ..
```

#### `JWT_SECRET_KEY` bị thiếu

Tạo file `.env` từ `.env.example` và điền khóa bí mật như phần 4.3.

#### `Thiếu YESCALE_API_KEY trong file .env`

Điền khóa YEScale vào `.env` ở thư mục gốc rồi dừng và chạy lại backend.

#### `'vite' is not recognized`

Cài thư viện frontend trước:

```powershell
cd frontend
npm install
```

#### Không mở được `http://127.0.0.1:8000/docs`

Kiểm tra terminal backend còn chạy và đã hiện `Application startup complete`.

## 5. Thành viên

### Nhóm Frontend

| Thành viên | Vai trò |
| --- | --- |
| Nguyễn Minh Hoàng | Trưởng nhóm, Frontend Developer |
| Nguyễn Minh Lương | Frontend Developer |
| Lương Quỳnh Anh | Frontend Developer |

Nhóm Frontend phụ trách giao diện người dùng, bản đồ, camera, hộ chiếu di sản, phần thưởng và tích hợp API từ backend.

### Nhóm Backend

| Thành viên | Vai trò |
| --- | --- |
| Lê Bá Tiệp | Backend Developer |
| Lê Hiền Anh | Backend Developer |
| Nguyễn Duy Nam | Backend Developer |
| Lê Bá Ninh | Backend Developer |

Nhóm Backend phụ trách API, xác thực người dùng, xử lý vị trí, check-in, dữ liệu hiện vật, hộ chiếu, phần thưởng và kết nối với các dịch vụ AI.
