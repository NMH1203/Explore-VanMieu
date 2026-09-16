# Cấu trúc dự án Web Explore Van Mieu

```text
khamphavanmieu/
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── locations/
│   │   │   ├── artifacts/
│   │   │   └── rewards/
│   │   ├── icons/
│   │   ├── fonts/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   └── src/
│       ├── pages/
│       │   ├── home/
│       │   ├── explore/
│       │   ├── map/
│       │   ├── location-detail/
│       │   ├── check-in/
│       │   ├── passport/
│       │   ├── rewards/
│       │   ├── login/
│       │   ├── register/
│       │   ├── account/
│       │   └── admin/
│       │
│       ├── components/
│       │   ├── header/
│       │   ├── navigation/
│       │   ├── footer/
│       │   ├── location-card/
│       │   ├── map-view/
│       │   ├── check-in-form/
│       │   ├── passport-stamp/
│       │   ├── reward-card/
│       │   ├── modal/
│       │   └── loading/
│       │
│       ├── layouts/
│       │   ├── main-layout/
│       │   ├── auth-layout/
│       │   └── admin-layout/
│       │
│       ├── services/
│       │   ├── auth-service/
│       │   ├── location-service/
│       │   ├── check-in-service/
│       │   ├── passport-service/
│       │   ├── reward-service/
│       │   └── user-service/
│       │
│       ├── hooks/
│       ├── store/
│       ├── routes/
│       ├── styles/
│       ├── utils/
│       └── config/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth-controller/
│   │   │   ├── user-controller/
│   │   │   ├── location-controller/
│   │   │   ├── check-in-controller/
│   │   │   ├── passport-controller/
│   │   │   ├── reward-controller/
│   │   │   └── admin-controller/
│   │   │
│   │   ├── routes/
│   │   │   ├── auth-routes/
│   │   │   ├── user-routes/
│   │   │   ├── location-routes/
│   │   │   ├── check-in-routes/
│   │   │   ├── passport-routes/
│   │   │   ├── reward-routes/
│   │   │   └── admin-routes/
│   │   │
│   │   ├── services/
│   │   │   ├── auth-service/
│   │   │   ├── location-service/
│   │   │   ├── gps-service/
│   │   │   ├── check-in-service/
│   │   │   ├── passport-service/
│   │   │   └── reward-service/
│   │   │
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── utils/
│   │   └── app/
│   │
│   ├── tests/
│   └── package.json
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── schema/
│   └── backups/
│
├── storage/
│   ├── location-images/
│   ├── artifact-images/
│   ├── user-avatars/
│   └── reward-assets/
│
├── tests/
│   ├── frontend/
│   ├── backend/
│   └── integration/
│
├── docs/
│   ├── api/
│   ├── database/
│   ├── diagrams/
│   ├── requirements/
│   └── deployment/
│
├── deployment/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Các chức năng chính

- Hiển thị danh sách địa điểm và hiện vật tại Văn Miếu.
- Hiển thị vị trí người dùng và địa điểm trên bản đồ.
- Mở khóa địa điểm dựa trên khoảng cách GPS.
- Check-in tại các địa điểm đã đến.
- Lưu lịch sử tham quan của người dùng.
- Thu thập con dấu trong hộ chiếu di sản số.
- Theo dõi cột mốc và trạng thái nhận phần thưởng.
- Đăng ký, đăng nhập và quản lý tài khoản.
- Quản trị địa điểm, nội dung, người dùng và phần thưởng.

## Chức năng các thư mục chính

- `frontend`: Giao diện và tương tác trên trình duyệt.
- `backend`: API, xác thực người dùng và nghiệp vụ của hệ thống.
- `database`: Cấu trúc bảng, migration, dữ liệu mẫu và bản sao lưu.
- `storage`: Tài nguyên hình ảnh và tệp được tải lên.
- `tests`: Kiểm thử từng phần và kiểm thử tích hợp.
- `docs`: Tài liệu kỹ thuật và yêu cầu dự án.
- `deployment`: Cấu hình triển khai ứng dụng.

## Phân chia theo vai trò

- Frontend Developer phụ trách `frontend` và `tests/frontend`.
- Backend Developer phụ trách `backend`, `database` và `tests/backend`.
- Các thành viên phối hợp tại `tests/integration`, `docs` và `deployment`.
