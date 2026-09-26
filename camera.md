# Tài liệu Bàn giao Kỹ thuật: Module Camera & Quét Nhận diện Di tích 2 Lớp (`/Explore/Camera`)

Tài liệu này được biên soạn dành cho nhóm phát triển dự án **Explore Van Mieu** nhằm tổng hợp toàn bộ thông tin hoàn thành, cấu trúc thư mục độc lập, kiến trúc kỹ thuật của quy trình check-in 2 lớp và hướng dẫn phối hợp để tránh xung đột (conflict) Git khi làm việc nhóm.

---

## 1. Tổng quan Tính năng & Giao diện Mới (Camera Thực tế)

Module **Camera & Quét Nhận diện** đã được tinh chỉnh hoàn thiện theo đúng chuẩn Camera hiện đại:
- **Đường dẫn màn hình**: `/Explore/Camera`.
- **Mục tiêu chính**: Tạo trải nghiệm quét và nhận diện khuôn mặt / hiện vật, công trình di tích tự nhiên như ứng dụng Camera thật trên điện thoại và laptop.
- **Những tính năng & quy cách hiển thị chính**:
  1. **Hiển thị chung 1 khung hình (Single Viewport)**: Toàn bộ video webcam, thanh tiến trình, banner GPS, thông điệp hướng dẫn, nút chụp tròn và nút đổi camera đều nổi bật trên cùng 1 khung hình, tuyệt đối không bị cuộn trang hay che khuất.
  2. **Mặc định Camera trước (webcam quét mặt)**: Tự động kết nối camera trước với hiệu ứng **lật gương (mirror `scaleX(-1)`)** tự nhiên như soi gương. Tự động fallback sang bất kỳ webcam nào đang kết nối nếu thiết bị không phân biệt camera trước/sau.
  3. **Nút đổi Camera `[ 🔄 Cam trước / Cam sau ]`**: Nằm ngay bên phải nút chụp tròn, cho phép người dùng chuyển đổi linh hoạt qua lại giữa camera trước và camera sau bất cứ lúc nào.
  4. **Thanh tiến trình hướng dẫn (Progress Bar)**: Đặt ở vị trí trung tâm trên cùng, kích thước chữ to hơn và in đậm rõ nét (`14.5px, font-weight: 800-900`): `1 · Quét —— 2 · Nhận diện AI —— 3 · Khám phá`.
  5. **Khung thông điệp hướng dẫn**: Hiển thị hộp chỉ dẫn thanh lịch ngay phía trên nút chụp: *"Hướng camera vào khuôn mặt hoặc hiện vật cần nhận diện, sau đó bấm nút chụp."*
  6. **Nút chụp tròn lớn (76px)**: Nút chụp tròn đôi viền trắng sang trọng, tích hợp âm thanh chụp cơ học ("tách") qua Web Audio API và hiệu ứng chớp sáng màn trập (Shutter Flash).
  7. **Chạm để lấy nét (Tap to Focus)**: Chạm bất cứ điểm nào trên màn hình để hiện vòng lấy nét vàng tinh tế.

---

## 2. Cấu trúc Thư mục Độc lập (Isolation Architecture)

Toàn bộ mã nguồn của module Camera nằm khép kín trong thư mục `frontend/src/pages/camera/`:

```text
frontend/src/pages/camera/
├── CameraPage.jsx                 # Component trang chính: Điều phối hiển thị chung 1 khung hình, luồng chụp & nhận diện
├── camera.css                     # CSS giao diện camera, mirror video, thanh tiến trình, nút chụp 76px, nút đổi cam
├── hooks/
│   ├── useCameraStream.js         # Hook WebRTC: Mặc định camera trước, lật gương mirror, âm thanh màn trập, đổi cam
│   └── useLiveLocation.js         # Hook Geolocation: Lấy GPS thực tế, tính khoảng cách Haversine tới 10 công trình
└── components/
    ├── CameraViewfinder.jsx       # Component chứa luồng <video> thật (lật gương) và hiệu ứng tap to focus
    ├── LocationBanner.jsx         # Component hiển thị tọa độ GPS gọn gàng phía trên
    └── ScanResultModal.jsx        # Modal thông báo nhận diện thành công, độ tin cậy AI và các nút điều hướng
```

---

## 3. Chi tiết Kỹ thuật Áp dụng

### 1. `hooks/useCameraStream.js`
- **Mặc định `facingMode: 'user'`**: Tự động mở webcam máy tính/laptop để soi mặt trực tiếp.
- **Lật gương tự nhiên (`mirror`)**: Áp dụng `transform: scaleX(-1)` cho cả thẻ video trực tiếp và ảnh chụp canvas khi ở chế độ camera trước.
- **Chuyển đổi Camera (`toggleFacingMode`)**: Đổi qua lại tức thì giữa `user` và `environment`.
- **Âm thanh màn trập (`playShutterSound`)**: Bộ tổng hợp âm thanh bằng Web Audio API không cần tải file âm thanh ngoài, phát tiếng click cơ học cực kỳ chân thực.

### 2. `hooks/useLiveLocation.js`
- **Công nghệ**: HTML5 Geolocation API (`navigator.geolocation.watchPosition`).
- **Thuật toán Haversine**: Tính toán khoảng cách thực tế (đơn vị: mét) từ vị trí người dùng đến 10 điểm GPS Văn Miếu (lấy từ dữ liệu `mapData.js`).
- **Quy tắc bán kính hợp lệ**: Tự động đánh dấu vị trí hợp lệ khi khoảng cách $\le 50\text{ m}$.

### 3. `components/CameraViewfinder.jsx`
- Hiển thị luồng video webcam trực tiếp, không dùng ảnh di tích làm nền giả.
- Hỗ trợ tap-to-focus tại vị trí nhấp chuột/chạm tay.

### 4. `components/LocationBanner.jsx`
- Đặt gọn gàng ở đỉnh màn hình dưới thanh tiến trình: Chấm trạng thái GPS (xanh khi hợp lệ), tên công trình gần nhất, khoảng cách và độ chính xác GPS.

### 5. `components/ScanResultModal.jsx`
- Card kết quả xuất hiện dạng hiệu ứng trượt mượt mà khi nhận diện thành công (98.4%).
- Tự động lưu mở khóa công trình vào `localStorage` qua hàm `unlockLocation(id)`.

### 6. `CameraPage.jsx` & `camera.css`
- Bố cục **chung 1 khung hình** (`height: 100vh; overflow: hidden; pointer-events: none` cho lớp overlay và `pointer-events: auto` cho nút bấm).
- Nút chụp tròn 76px viền đôi ở trung tâm dưới cùng.
- Nút đổi Camera `[ 🔄 Cam trước / Cam sau ]` nằm ngay bên phải nút chụp.
- Hộp thông điệp hướng dẫn nằm ngay phía trên nút chụp.

---

## 4. Hướng dẫn Chạy & Kiểm thử

### 1. Khởi động ứng dụng:
```bash
cd frontend
npm run dev
```

### 2. Truy cập màn hình Camera:
👉 **`http://localhost:5173/Explore/Camera`**

### 3. Kiểm tra tính hợp lệ của mã nguồn:
```bash
npm run build    # Đảm bảo 0 lỗi biên dịch Vite
```

---

*Tài liệu này được cập nhật vào ngày 26/09/2026 bởi thành viên phụ trách nhóm Frontend (Module Bản đồ & Camera).*
