# Module Camera (`/Explore/Camera`)

## Luồng hiện tại

1. Người dùng đăng nhập và mở `/Explore/Camera`.
2. Nhấn **Bắt đầu quét** để trình duyệt xin quyền camera.
3. Chụp ảnh; frontend gửi ảnh, GPS và địa điểm mục tiêu tới `POST /api/checkins/verify`.
4. Nếu nhận diện thất bại, ảnh vừa chụp được giữ lại để người dùng chọn địa điểm đối chiếu.
5. Sau khi xác nhận địa điểm, giao diện quay lại chế độ chụp và hiển thị mục tiêu cạnh nút chụp.
6. Khi backend xác minh cả GPS và hình ảnh, tiến trình được ghi vào SQLite và dấu ấn được mở.

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

- `CameraPage.jsx`: điều phối trạng thái chụp, chọn lại mục tiêu và gọi API xác minh.
- `useCameraStream.js`: xin quyền WebRTC từ thao tác người dùng, quản lý stream và chụp frame.
- `useLiveLocation.js`: theo dõi GPS và tính địa điểm gần nhất.
- `CameraViewfinder.jsx`: video/fallback, ảnh đã chụp và khung ngắm.
- `ScanResultModal.jsx`: kết quả khi xác minh thành công.
- `camera.css`: giao diện riêng của module camera.

## Backend liên quan

- `backend/src/routes/checkins.py`: xác minh GPS và hình ảnh, ghi `checkin_logs` và `user_history`.
- `backend/src/services/vision.py`: gọi dịch vụ nhận diện ảnh.
- `backend/src/services/image_processing.py`: kiểm tra và chuẩn hóa ảnh đầu vào.
- `backend/src/routes/target.py`: trả địa điểm mục tiêu cố định của tài khoản.

## Kiểm thử

```powershell
cd frontend
npm test
npm run build

cd ..
python -m pytest backend\tests -q
```

Camera chỉ hoạt động trên `localhost` hoặc HTTPS và cần người dùng cấp quyền camera/vị trí.
