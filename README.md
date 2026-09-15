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

## 2. Chức năng chính

### 2.1 Chức năng dành cho du khách

- Đăng ký và đăng nhập tài khoản.
- Xem thông tin và vị trí các địa điểm trên bản đồ.
- Xem vị trí hiện tại của người dùng.
- Tự động mở khóa địa điểm khi người dùng đi vào phạm vi cho phép.
- Chụp ảnh hiện vật bằng camera.
- Xem kết quả nhận diện hiện vật.
- Đọc nội dung thuyết minh được hỗ trợ bởi AI.
- Đặt câu hỏi về địa điểm, lịch sử và hiện vật.
- Check-in tại các địa điểm đã đến.
- Xem lịch sử tham quan.
- Sưu tầm con dấu trong hộ chiếu di sản số.
- Theo dõi tiến độ hoàn thành các cột mốc.
- Nhận thông báo khi đủ điều kiện nhận phần thưởng.
- Quản lý thông tin tài khoản cá nhân.

### 2.2 Chức năng dành cho quản trị viên

- Quản lý thông tin địa điểm.
- Quản lý thông tin di tích và hiện vật.
- Quản lý hình ảnh của địa điểm và hiện vật.
- Quản lý tài khoản người dùng.
- Quản lý con dấu và lịch sử check-in.
- Thiết lập điều kiện hoàn thành cột mốc.
- Quản lý phần thưởng và trạng thái đổi thưởng.

### 2.3 Chế độ giả lập

Simulator Mode cho phép nhóm phát triển lựa chọn một vị trí GPS giả lập ngay trên giao diện. Chế độ này được sử dụng để kiểm thử và trình diễn các chức năng phụ thuộc vị trí mà không cần phải có mặt trực tiếp tại địa điểm.

Vị trí giả lập chỉ phục vụ phát triển và kiểm thử, không được sử dụng để xác nhận lượt check-in thật.

## 3. Luồng sử dụng cơ bản

1. Người dùng mở ứng dụng trên điện thoại.
2. Người dùng đăng nhập và cho phép ứng dụng truy cập vị trí.
3. Bản đồ hiển thị vị trí hiện tại và các địa điểm di sản ở gần.
4. Khi người dùng đi vào phạm vi của một địa điểm, nội dung tương ứng được mở khóa.
5. Người dùng mở camera và chụp ảnh hiện vật.
6. Backend kiểm tra tọa độ GPS và gửi ảnh đến hệ thống nhận diện.
7. Ứng dụng hiển thị tên hiện vật và nội dung thuyết minh.
8. Nếu kết quả xác thực hợp lệ, hệ thống ghi nhận lượt check-in.
9. Một con dấu mới được thêm vào hộ chiếu di sản số.
10. Hệ thống kiểm tra tiến độ và thông báo nếu người dùng đạt mốc phần thưởng.

## 4. Công nghệ dự kiến

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

Backend Python hiện chưa được cài đặt trong dự án.

### AI

- YOLOv8 hoặc YOLOv11 để nhận diện hiện vật.
- PyTorch để huấn luyện hoặc tinh chỉnh mô hình.
- TensorRT để tối ưu mô hình khi triển khai trên thiết bị phù hợp.
- Qwen, Gemma hoặc mô hình ngôn ngữ tương tự để tạo nội dung thuyết minh.
- Ollama để chạy mô hình ngôn ngữ cục bộ nếu cần.

Các thư viện AI sẽ được cài đặt sau khi nhóm thống nhất mô hình và thiết bị triển khai.

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

## 5. Cấu trúc thư mục

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

## 6. Cài đặt và chạy frontend

### Yêu cầu

- Node.js phiên bản 18 trở lên.
- npm.

### Cài đặt thư viện

Từ thư mục gốc của dự án, chạy:

```bash
cd frontend
npm install
```

### Chạy môi trường phát triển

```bash
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập trong terminal. Địa chỉ mặc định thường là:

```text
http://localhost:5173
```

### Tạo bản build production

```bash
npm run build
```

### Xem thử bản build production

```bash
npm run preview
```

## 7. Thành viên

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
