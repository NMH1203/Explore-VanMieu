# Kiểm thử trên trình duyệt của bạn

API đã có kiểm thử tự động bằng `npm test`. Các bước dưới đây giúp kiểm tra tích hợp với quyền trình duyệt và bố cục ở máy thật.

## Khách tham quan

1. Chạy ứng dụng, mở cổng 3000. Danh sách có 10 địa điểm; không có tên/tài khoản người dùng giả, không có con dấu đã thu thập sẵn.
2. Mở Tài khoản, thử đăng ký với hai mật khẩu khác nhau: nhận lỗi tại form. Đăng ký hợp lệ: xuất hiện tên người dùng và chức năng đăng xuất.
3. Tìm `Khuê` ở Tất cả địa điểm: chỉ hiển thị Khuê Văn Các. Xóa từ khóa để thấy lại toàn bộ.
4. Mở chi tiết một địa điểm chưa check-in: chỉ thấy giới thiệu; câu chuyện đầy đủ đang khóa. Hiện vật của địa điểm có thể xem công khai.
5. Bấm Lấy vị trí của tôi. Từ chối quyền GPS: hiện thông báo có hướng dẫn, không tạo check-in.
6. Dùng Sensors theo README để mô phỏng GPS gần Khuê Văn Các; check-in hợp lệ: nhận một con dấu và mở nội dung.
7. Bấm check-in lại cùng ngày: số con dấu và số lượt không tăng. Đổi GPS sang nơi xa: bị từ chối.
8. Vào Hộ chiếu, nhận huy hiệu Bước đầu hành trình: màu ứng dụng đổi; tải lại trang vẫn giữ màu và con dấu.
9. Đăng xuất: thông tin riêng và huy hiệu của người cũ không còn hiển thị. Đăng nhập tài khoản khác: passport độc lập.
10. Đổi tên và đổi mật khẩu; đổi mật khẩu thành công phải đăng nhập lại. Phiên ở tab/trình duyệt khác không truy cập API riêng được nữa.

## Camera và bản đồ

Camera cần thiết bị có camera, localhost hoặc HTTPS. Bấm Mở camera rồi rời màn hình camera: stream phải dừng. Camera không chụp hoặc tải ảnh lên server và không dùng để xác nhận check-in. Kiểm tra cả trường hợp thiết bị không có camera hoặc bị từ chối quyền.

Sơ đồ có tên địa điểm qua tooltip và danh sách bên cạnh. Chấm xanh chỉ xuất hiện khi vị trí GPS trong khung địa điểm. Nếu vị trí ở xa, sơ đồ ghi rõ ngoài khung và danh sách hiển thị khoảng cách. Nét đứt chỉ là thứ tự hành trình.

## Quản trị

1. Tạo admin bằng CLI, đăng nhập, mở Quản trị.
2. Thêm địa điểm, sửa câu chuyện/tọa độ và kiểm tra ngoài trang Khám phá.
3. Thêm hiện vật gắn địa điểm đó; kiểm tra hiện vật hiện đúng trang chi tiết.
4. Ẩn một địa điểm đã có người check-in: danh mục công khai không còn; hộ chiếu vẫn giữ con dấu đã lưu.
5. Sửa bản ghi đã ẩn, đặt Hiển thị Có: địa điểm xuất hiện lại.
6. Tạo quà loại physical, mốc 1, tồn kho 1. Nhận quà bằng hai tài khoản đủ mốc: chỉ một tài khoản được nhận. Trong Trao thưởng, xác nhận đã trao; hộ chiếu người nhận cập nhật trạng thái.
7. Khóa một visitor đang đăng nhập: yêu cầu riêng tiếp theo bị từ chối. Mở khóa, đăng nhập lại được.
8. Thử tự hạ quyền hoặc tự khóa admin hiện tại: bị từ chối.
9. Kiểm tra Nhật ký có tên admin, loại thao tác và ID bản ghi tương ứng.

## Hiển thị

Thử các chiều rộng 390, 768, 1440 px. Kiểm tra menu di động, form, bảng cuộn ngang, dialog quản trị và nhãn con dấu. Thử bàn phím Tab/Enter, tìm lỗi trong DevTools Console và failed requests trong Network. CSS gốc có Google Fonts; khi không có mạng trang dùng font hệ thống.

## Kết quả đã xác minh trong môi trường tạo mã

20 kiểm thử backend đều đạt trên Node.js v24.19.0, SQLite v3.53.3; toàn bộ file JS qua kiểm tra cú pháp. Trình duyệt kiểm tra từ xa bị chặn khi truy cập localhost, nên danh sách thủ công ở trên chưa được xác nhận bằng trình duyệt tại môi trường này. Docker cũng chưa được chạy thử tại đây.
