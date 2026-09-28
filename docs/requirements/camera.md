# Module Camera (`/Explore/Camera`)

## Luồng hiện tại

1. Người dùng đăng nhập và mở `/Explore/Camera`.
2. Nhấn **Bắt đầu quét** để trình duyệt xin quyền camera.
3. Chụp ảnh; frontend chỉ gửi ảnh và GPS tới `POST /api/checkins/verify`.
4. Backend tính khoảng cách tới toàn bộ địa điểm và chọn đúng một địa điểm gần GPS nhất.
5. AI nhận dạng công trình từ toàn bộ nhãn địa điểm trong database.
6. Backend chỉ xác minh khi nhãn AI trùng với địa điểm gần GPS nhất, confidence đạt ngưỡng và khoảng cách nằm trong geofence.
7. Nếu nhận diện hoặc GPS thất bại, giao diện hướng dẫn người dùng chụp lại mà không yêu cầu biết tên công trình.
8. Khi backend xác minh cả GPS và hình ảnh, tiến trình được ghi vào SQLite và dấu ấn được mở.

## Cấu trúc thư mục

```text
frontend/src/pages/camera/
├── CameraPage.jsx
├── camera.css
├── hooks/
│   ├── useCameraStream.js
│   └── useLiveLocation.js
└── components/
    ├── CameraViewfinder.jsx
    └── ScanResultModal.jsx
```

- `CameraPage.jsx`: điều phối trạng thái chụp, gửi ảnh cùng GPS và hiển thị kết quả nhận dạng.
- `useCameraStream.js`: xin quyền WebRTC từ thao tác người dùng, quản lý stream và chụp frame.
- `useLiveLocation.js`: theo dõi GPS và tính địa điểm gần nhất.
- `CameraViewfinder.jsx`: video/fallback, ảnh đã chụp và khung ngắm.
- `ScanResultModal.jsx`: kết quả khi xác minh thành công.
- `camera.css`: giao diện riêng của module camera.

## Backend liên quan

- `backend/src/routes/checkins.py`: chọn địa điểm gần GPS nhất, đối chiếu với `yolo_label` từ AI, xác minh geofence và ghi `checkin_logs` cùng `user_history`.
- `backend/src/services/vision.py`: gọi dịch vụ nhận diện ảnh.
- `backend/src/services/image_processing.py`: kiểm tra và chuẩn hóa ảnh đầu vào.
- `backend/src/routes/target.py`: trả địa điểm mục tiêu cố định của tài khoản.

Camera chỉ hoạt động trên `localhost` hoặc HTTPS và cần người dùng cấp quyền camera/vị trí.
