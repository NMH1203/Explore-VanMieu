# Tài liệu Bàn giao Kỹ thuật: Trang Bản đồ Di tích Văn Miếu (`/Explore/Ban-Do`)

Tài liệu này được biên soạn dành cho nhóm phát triển dự án **Explore Van Mieu** nhằm tổng hợp toàn bộ thông tin hoàn thành, cấu trúc thư mục độc lập, tọa độ GPS thực tế của 10 công trình và hướng dẫn phối hợp để tránh xung đột (conflict) Git khi làm việc nhóm.

---

## 1. Tổng quan Tính năng

Trang **Bản đồ Di tích** là một trong hai tính năng trọng tâm của ứng dụng Explore Văn Miếu:
- **Tên màn hình**: Bản đồ Văn Miếu (`/Explore/Ban-Do`).
- **Nhiệm vụ chính**: Giúp du khách định vị không gian, theo dõi trục tham quan Nam - Bắc, nhận biết trạng thái đã mở khóa (đã check-in) hay chưa mở khóa của từng công trình, và điều hướng nhanh sang tính năng quét Camera hoặc đọc câu chuyện di sản.
- **Công nghệ áp dụng**: React 19, Leaflet (kết hợp OpenStreetMap Tile Layer), CSS Responsive phong cách di sản.

---

## 2. Danh sách 10 Điểm Di tích (Markers / POIs) & Tọa độ GPS Thật

Tọa độ GPS đã được chuẩn hóa theo vị trí địa lý thực tế tại di tích Quốc gia đặc biệt Văn Miếu – Quốc Tử Giám (Hà Nội):

| STT | Tên công trình | Tên tiếng Anh | Vĩ độ (Lat) | Kinh độ (Lng) | Đường dẫn hình ảnh thực tế | Route chi tiết |
|:---:|---|---|:---:|:---:|---|---|
| **1** | **Cổng Văn Miếu** | Van Mieu Gate | `21.02758` | `105.83551` | `/images/heritage/van-mieu-gate.webp` | `/Explore/Cong-Van-Mieu` |
| **2** | **Cổng Đại Trung** | Dai Trung Gate | `21.02817` | `105.83574` | `/images/heritage/dai-trung-gate.webp` | `/Explore/Cong-Dai-Trung` |
| **3** | **Khuê Văn Các** | Khue Van Cac | `21.02868` | `105.83592` | `/images/heritage/khue-van-cac.webp` | `/Explore/Khue-Van-Cac` |
| **4** | **Cổng Đại Thành** | Dai Thanh Gate | `21.02908` | `105.83608` | `/images/heritage/dai-thanh-gate.webp` | `/Explore/Cong-Dai-Thanh` |
| **5** | **Điện Đại Thành** | Dai Thanh Sanctuary | `21.02935` | `105.83619` | `/images/heritage/dien-dai-thanh.webp` | `/Explore/Dien-Dai-Thanh` |
| **6** | **Cổng Thái Học** | Thai Hoc Gate | `21.02951` | `105.83626` | `/images/heritage/thai-hoc-gate.webp` | `/Explore/Cong-Thai-Hoc` |
| **7** | **Nhà Thái Học** | Thai Hoc Building | `21.02998` | `105.83643` | `/images/heritage/thai-hoc-building.webp` | `/Explore/Nha-Thai-Hoc` |
| **8** | **Lầu Chuông – Lầu Trống** | Bell & Drum Towers | `21.02996` | `105.83631` | `/images/heritage/bell-drum-tower.webp` | `/Explore/Lau-Chuong-Lau-Trong` |
| **9** | **Nhà Bát Giác** | Octagonal House | `21.02891` | `105.83533` | `/images/heritage/octagonal-house.webp` | `/Explore/Nha-Bat-Giac` |
| **10** | **Phương Đình (Hồ Văn)** | Phuong Dinh Pavilion | `21.02672` | `105.83630` | `/images/heritage/phuong-dinh.webp` | `/Explore/Phuong-Dinh` |

---

## 3. Cấu trúc Thư mục Độc lập (Isolation Architecture)

Để đảm bảo các thành viên khác làm việc song song (ví dụ: làm trang Camera, Hộ chiếu, Trang chủ) **không bao giờ bị xung đột (conflict) Git**, toàn bộ mã nguồn của tính năng bản đồ được đóng gói khép kín trong thư mục `frontend/src/pages/map/`:

```text
frontend/src/pages/map/
├── MapPage.jsx                     # Component chính: Điều phối layout, state lựa chọn địa điểm
├── map.css                         # Toàn bộ CSS phong cách di sản, pin marker, sidebar & responsive
├── mapData.js                      # Chứa mảng dữ liệu 10 công trình, GPS thật, bounding box Văn Miếu
└── components/                     # Thư mục chứa các component con độc lập
    ├── InteractiveMap.jsx          # Component bản đồ Leaflet, xử lý marker HTML, zoom/pan tự động
    └── LocationSidebar.jsx         # Component danh sách 10 công trình, đồng bộ cuộn và highlight 2 chiều
```

### Chi tiết vai trò từng file:
1. **`mapData.js`**:
   - Khai báo hằng số `VAN_MIEU_BOUNDS` (tọa độ trung tâm `21.02875, 105.8360`, giới hạn zoom từ 16 đến 19, giới hạn khung nhìn bản đồ để không bị kéo ra ngoài khu vực Văn Miếu).
   - Khai báo mảng `MAP_LOCATIONS` chứa 10 địa danh với đầy đủ metadata (id, tên, ảnh, GPS, mô tả ngắn, link chuyển hướng).
2. **`components/InteractiveMap.jsx`**:
   - Sử dụng thư viện `leaflet` thuần kết hợp `useRef` và `useEffect` của React.
   - Render 10 custom HTML marker dạng giọt nước (pin) có số thứ tự `1` đến `10`.
   - Màu sắc marker:
     - **Màu ngọc bích (Jade)** có dấu tích `✓`: Đã mở khóa.
     - **Màu đỏ sơn son (Lacquer)** có số thứ tự: Chưa mở khóa.
     - **Hiệu ứng Selected**: Marker được phóng to (scale 1.3) kèm vòng hào quang vàng khi đang được chọn.
   - Khi `selectedLocation` thay đổi, bản đồ tự động gọi `map.panTo()` lia mượt mà về vị trí đó.
3. **`components/LocationSidebar.jsx`**:
   - Render danh sách 10 thẻ địa danh bên cạnh bản đồ.
   - Hiển thị ảnh thumbnail thực tế, số thứ tự, khoảng cách ước tính và nút hành động tương ứng (`Xem câu chuyện di sản` hoặc `Quét để mở khóa`).
   - Tự động cuộn (`scrollIntoView`) đến thẻ được chọn khi người dùng bấm vào một marker trên bản đồ.
4. **`MapPage.jsx`**:
   - Kết nối với hook toàn cục `useUnlockedLocations()` từ `frontend/src/state/heritageProgress.js` để đọc trạng thái đã mở khóa.
   - Quản lý state `selectedLocation` dùng chung giữa bản đồ và danh sách.
   - Hiển thị card tóm tắt thông tin chi tiết địa điểm đang chọn ngay dưới bản đồ.
5. **`map.css`**:
   - Quản lý toàn bộ hiệu ứng thị giác: giao diện 2 cột trên Desktop (tỷ lệ 1.4 : 1), co giãn tự động thành 1 cột trên Tablet và Mobile.
   - Không gây ảnh hưởng (override) lên các file CSS chung của dự án.

---

## 4. Các Thư viện Phụ thuộc (Dependencies)

- **`leaflet`**: Thư viện bản đồ mã nguồn mở nhẹ và phổ biến nhất, đã được thêm vào `frontend/package.json`.
- **`lucide-react`**: Thư viện icon (đã có sẵn trong dự án) phục vụ cho các nút bấm và dấu tick.

---

## 5. Cơ chế Tương tác 2 Chiều (Two-Way Interaction)

- **Từ Danh sách ➔ Bản đồ**:
  - Khi click vào bất kỳ thẻ công trình nào trong danh sách 10 địa danh, state `selectedLocation` được cập nhật ➔ Bản đồ Leaflet tự động lia tâm (panTo) tới tọa độ GPS của công trình đó và phóng to làm nổi bật pin marker tương ứng.
- **Từ Bản đồ ➔ Danh sách**:
  - Khi click vào bất kỳ pin marker nào trên bản đồ, thẻ địa danh tương ứng trong danh sách sẽ được gắn class `.active` (viền vàng nổi bật) và tự động cuộn đến tầm nhìn của người dùng.
  - Đồng thời hiển thị card thông tin chi tiết dưới chân bản đồ kèm tọa độ vĩ độ/kinh độ chính xác đến 5 chữ số thập phân.

---

## 6. Hướng dẫn Chạy & Kiểm tra

### Khởi động máy chủ:
```bash
cd frontend
npm install      # Đã cài leaflet
npm run dev      # Khởi chạy Vite dev server
```

### Đường dẫn truy cập:
Mở trình duyệt truy cập vào đường dẫn:
👉 **`http://localhost:5173/Explore/Ban-Do`**

### Kiểm tra tính hợp lệ của mã nguồn:
```bash
npm run build    # Đảm bảo 0 lỗi biên dịch, bundle sinh ra sạch sẽ
```

---

*Tài liệu này được tạo vào ngày 18/09/2026 bởi thành viên phụ trách nhóm Frontend (Module Bản đồ & Camera).*
