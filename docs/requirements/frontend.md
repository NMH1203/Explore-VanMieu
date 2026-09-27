# Công việc của nhóm Frontend - Dự án Explore Van Mieu

Dựa trên tài liệu phân tích yêu cầu (README) và cấu trúc thư mục mà leader đã thiết lập trong `frontend/src`, dưới đây là bản mô tả chi tiết tất cả các công việc nhóm Frontend cần thực hiện. 

Nhiệm vụ trọng tâm của nhóm là phát triển giao diện người dùng (React/Vite), tích hợp bản đồ, camera cho tính năng check-in, hộ chiếu di sản số và kết nối dữ liệu qua API với backend.

---

## 1. Phát triển các Trang (Pages)
*(Thư mục: `frontend/src/pages/`)*

Nhóm cần xây dựng giao diện và kết nối logic dữ liệu cho các trang (pages) đã được định nghĩa:
- **`home`**: Trang chủ giới thiệu về ứng dụng Explore Van Mieu, thông tin tổng quan và hướng dẫn sử dụng.
- **`login` & `register`**: Các trang xác thực người dùng (đăng nhập, đăng ký tài khoản).
- **`map`**: Trang bản đồ tổng thể của khu di tích. Tích hợp thư viện bản đồ để hiển thị các điểm tham quan và vị trí hiện tại của người dùng thông qua GPS.
- **`explore`**: Trang khám phá, hiển thị danh sách các địa điểm di sản hoặc hiện vật có trong hệ thống.
- **`location-detail`**: Trang chi tiết về một địa điểm/hiện vật cụ thể. Hiển thị thông tin lịch sử, hình ảnh và cung cấp nút để tiến hành check-in.
- **`check-in`**: Trang xử lý luồng check-in 2 lớp quan trọng:
  - Yêu cầu và lấy tọa độ GPS hiện tại.
  - Mở camera để người dùng chụp ảnh hiện vật.
  - Gửi dữ liệu lên API và hiển thị nội dung thuyết minh từ AI trả về.
- **`passport`**: Trang "Hộ chiếu di sản số". Nơi lưu trữ và hiển thị đồ họa các "con dấu" mà du khách sưu tầm được.
- **`rewards`**: Trang hiển thị danh sách phần thưởng, điều kiện đổi thưởng dựa trên các cột mốc đã đạt được.
- **`account`**: Trang quản lý thông tin cá nhân và xem lại lịch sử tham quan.
- **`admin`**: Khu vực dành riêng cho Ban quản lý/Admin để quản lý địa điểm, thông tin ứng dụng.

## 2. Phát triển các Component UI tái sử dụng
*(Thư mục: `frontend/src/components/`)*

Xây dựng các thành phần giao diện dùng chung trên toàn ứng dụng:
- **`header` & `footer`**: Thanh điều hướng trên (logo, tiêu đề) và thông tin chân trang.
- **`navigation`**: Menu điều hướng chính (có thể tối ưu thành Bottom Navigation Bar cho điện thoại).
- **`map-view`**: Thành phần hiển thị bản đồ, đánh dấu các vị trí, tính năng zoom/pan.
- **`location-card`**: Component thẻ địa điểm (thumbnail, tên, mô tả ngắn, khoảng cách) hiển thị dạng danh sách.
- **`check-in-form`**: Giao diện thao tác chụp ảnh và trạng thái gửi ảnh lên hệ thống.
- **`passport-stamp`**: Component trực quan hiển thị một con dấu (stamp), có thể kèm hiệu ứng khi vừa nhận được.
- **`reward-card`**: Thẻ hiển thị một phần thưởng và trạng thái (có thể đổi / chưa đủ điều kiện).
- **`modal`**: Các hộp thoại popup (hiển thị thông báo lỗi, popup khi check-in thành công, popup đọc thuyết minh di sản).
- **`loading`**: Giao diện hiển thị trạng thái chờ (skeleton, spinner) khi load dữ liệu hoặc chờ AI xử lý ảnh.

## 3. Tổ chức Bố cục (Layouts)
*(Thư mục: `frontend/src/layouts/`)*

Cấu hình các bộ khung giao diện để bọc các trang:
- **`main-layout`**: Bố cục chung cho ứng dụng chính (bao gồm Header, Navigation dưới cùng, nội dung cuộn ở giữa). Áp dụng cho các trang Explore, Map, Passport...
- **`auth-layout`**: Bố cục tối giản, tập trung vào form, dành riêng cho các trang Login/Register.
- **`admin-layout`**: Bố cục riêng cho quản trị viên, có thể đi kèm với Sidebar điều hướng bên trái.

## 4. Tích hợp API & Dịch vụ (Services)
*(Thư mục: `frontend/src/services/`)*

Viết các module gọi API kết nối tới Backend (sử dụng `fetch` hoặc `axios`):
- **`auth-service`**: Xử lý đăng nhập, đăng ký và lưu trữ token xác thực (JWT).
- **`user-service`**: Lấy thông tin người dùng và cập nhật hồ sơ cá nhân.
- **`location-service`**: Lấy danh sách địa điểm, thông tin chi tiết di tích và tọa độ.
- **`check-in-service`**: Module phức tạp nhất, chịu trách nhiệm gửi tọa độ GPS và luồng dữ liệu hình ảnh (FormData) lên server để xử lý AI, sau đó nhận lại kết quả/thuyết minh.
- **`passport-service`**: Đồng bộ dữ liệu hộ chiếu số từ backend.
- **`reward-service`**: Lấy thông tin các phần thưởng và gửi yêu cầu quy đổi phần thưởng.

## 5. Phát triển các Logic Hỗ trợ Khác
*(Các thư mục còn lại trong `frontend/src/`)*

- **`routes/`**: Định nghĩa các đường dẫn, chuẩn hóa URL cũ và ánh xạ URL sang page trong SPA.
- **`store/`**: Thiết lập State Management (như Redux, Zustand hoặc Context API). Quản lý trạng thái toàn cục như `user state`, `current location state`.
- **`hooks/`**: Xây dựng các Custom Hooks:
  - `useGeolocation`: Quản lý logic xin quyền và lấy tọa độ GPS liên tục.
  - `useCamera`: Quản lý API camera trình duyệt (getUserMedia).
- **`utils/`**: Cài đặt các hàm tiện ích: tính khoảng cách giữa 2 tọa độ (Haversine formula), format ngày giờ, format chuỗi.
- **`styles/`**: Tổ chức CSS toàn cục, các biến màu sắc chủ đạo, font chữ.
- **`config/`**: Lưu cấu hình dự án (ví dụ `VITE_API_URL`, cấu hình bản đồ, timeout hằng số...).

## 6. Quản lý Tài nguyên Tĩnh (Public Assets)
*(Thư mục: `frontend/public/`)*

- Phân bổ hình ảnh hiển thị cho ứng dụng vào: `images/locations/` (ảnh địa điểm), `images/artifacts/` (hiện vật), `images/rewards/`.
- Quản lý icon con dấu và hệ thống UI icons vào `icons/`.
- Đảm bảo font chữ đặc trưng được import từ `fonts/`.

---

## 7. Lịch sử Triển khai (Changelog)

Theo dõi sự thay đổi sau mỗi giai đoạn tại đây:

- **[Đã hoàn thành]** Khởi tạo cấu trúc thư mục React/Vite (Sử dụng `npm create vite@latest`).
- **[Đã hoàn thành]** Hoàn thiện Phase 1 - Giao diện cốt lõi (Global CSS, Variables, Layouts).
- **[Đã hoàn thành]** Hoàn thiện Phase 2 - Component & Mock Data (Chia nhỏ Component, giả lập 10 công trình).
- **[Đã hoàn thành]** Hoàn thiện Phase 3 - Camera & Map Logic (Custom Hooks `useCamera`, `useGeolocation`).
- **[Đã hoàn thành]** Hoàn thiện Phase 4 - Tích hợp API (Mô phỏng luồng nhận diện AI).
- **[Đã hoàn thành]** Hoàn thiện Phase 5 - Logic hỗ trợ khác (Context API lưu trạng thái, Haversine tính khoảng cách).
- **[Đã hoàn thành]** Hoàn thiện Phase 6 - Quản lý tài nguyên tĩnh & Các trang cuối (Map thật bằng Leaflet, Passport, Account).

---
*Tài liệu này được biên soạn bởi Frontend Leader để định hướng cho quá trình chuyển đổi giao diện từ HTML/CSS tĩnh sang React SPA.*
