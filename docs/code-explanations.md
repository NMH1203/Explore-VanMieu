# Tài liệu giải thích code — Explore Van Mieu

Tài liệu này tổng hợp các phần code đã được giải thích trong quá trình tìm hiểu dự án. Các nội dung tiếp theo sẽ được bổ sung theo từng file hoặc từng luồng chức năng, bao gồm cả API và những file liên quan khi cần thiết.

## Mục lục

1. [`frontend/src/main.jsx`](#frontendsrcmainjsx)

---

## `frontend/src/main.jsx`

### 1. Vai trò

`main.jsx` là điểm khởi động (entry point) của ứng dụng React. File này không trực tiếp xử lý nghiệp vụ hoặc gọi API. Nó thực hiện ba công việc chính:

1. Tìm phần tử HTML có `id="root"`.
2. Khởi tạo React tại phần tử đó.
3. Render component gốc `App` cùng các thành phần dùng chung như `StrictMode` và `LanguageProvider`.

### 2. Luồng khởi động

```text
Trình duyệt tải index.html
        ↓
index.html tạo <div id="root"></div>
        ↓
index.html tải /src/main.jsx
        ↓
main.jsx tạo React root
        ↓
LanguageProvider cung cấp chức năng đa ngôn ngữ
        ↓
App được render
        ↓
App xử lý route, đăng nhập, dữ liệu và gọi API
        ↓
Trang phù hợp được hiển thị
```

Điểm nối giữa HTML và React nằm trong `frontend/index.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

- `#root` là vùng DOM mà React sẽ quản lý.
- Thẻ `script` tải `main.jsx`.
- `type="module"` cho phép sử dụng cú pháp `import` và `export`.
- Vite chịu trách nhiệm xử lý JSX, module và CSS trong quá trình chạy hoặc build ứng dụng.

### 3. Giải thích các import

#### `StrictMode`

```jsx
import { StrictMode } from 'react'
```

`StrictMode` hỗ trợ phát hiện các vấn đề tiềm ẩn trong quá trình phát triển, chẳng hạn side effect không an toàn hoặc effect thiếu cleanup. Nó không tạo giao diện.

Trong môi trường development, React có thể chủ động chạy lại một số logic để phát hiện lỗi. Vì vậy, đôi khi có thể thấy effect hoặc request xuất hiện nhiều hơn một lần khi kiểm tra ứng dụng ở chế độ dev. Cơ chế kiểm tra này không hoạt động giống vậy trong bản production.

#### `createRoot`

```jsx
import { createRoot } from 'react-dom/client'
```

`createRoot` là cầu nối giữa cây component React và DOM của trình duyệt. Nó biến một DOM element thành vùng giao diện do React quản lý.

#### `App`

```jsx
import App from './App.jsx'
```

`App` là component gốc và bộ điều khiển trung tâm của frontend. `App.jsx` chịu trách nhiệm:

- Quản lý route hiện tại.
- Kiểm tra trạng thái đăng nhập.
- Bảo vệ các trang cần đăng nhập.
- Tải tiến độ check-in và phần thưởng.
- Điều hướng trong ứng dụng mà không tải lại toàn bộ trang.
- Chọn page cần render.

Có thể hiểu ngắn gọn:

```text
main.jsx = bật ứng dụng
App.jsx  = điều khiển ứng dụng
pages/   = giao diện từng màn hình
```

#### `LanguageProvider`

```jsx
import { LanguageProvider } from './i18n/LanguageContext.jsx'
```

`LanguageProvider` cung cấp dữ liệu đa ngôn ngữ cho toàn bộ component con, bao gồm:

- `lang`: ngôn ngữ hiện tại.
- `setLang`: hàm đổi ngôn ngữ.
- `t`: hàm lấy nội dung dịch.
- `locale`: locale hiện tại.

Ví dụ một component bên trong `App` có thể sử dụng:

```jsx
const { t } = useLanguage()

<h1>{t('common.notFound')}</h1>
```

`App` phải nằm bên trong `LanguageProvider`. Nếu không, `useLanguage()` sẽ không tìm thấy context và phát sinh lỗi.

#### CSS toàn cục

```jsx
import './styles/heritage.css'
```

Đây là một import tạo side effect: không nhận về biến, mà yêu cầu Vite nạp stylesheet vào ứng dụng. Vì CSS được import tại entry point nên các style trong file có thể áp dụng cho toàn bộ cây component.

### 4. Gắn React vào HTML

Code chính của file là:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
```

Có thể viết tách ra để dễ hiểu hơn:

```jsx
const rootElement = document.getElementById('root')
const reactRoot = createRoot(rootElement)

reactRoot.render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
```

Ý nghĩa từng bước:

1. `document.getElementById('root')` tìm `<div id="root">` trong `index.html`.
2. `createRoot(...)` tạo vùng giao diện do React quản lý.
3. `.render(...)` đưa cây component vào vùng đó.
4. Khi state hoặc props thay đổi, React cập nhật những phần DOM cần thiết.

Cây component ban đầu có cấu trúc:

```text
StrictMode
└── LanguageProvider
    └── App
        ├── RewardContext.Provider
        ├── Navigation
        └── Page hiện tại
```

### 5. Quan hệ với việc gọi API

`main.jsx` không trực tiếp gọi API. Các lời gọi API bắt đầu sau khi `App` được render. Trong `App.jsx`, các service sau được import:

```jsx
import { getRewards, claimReward } from './services/reward-service/index.js'
import { getCurrentUser, logout } from './services/auth-service/index.js'
import { getProgress } from './services/passport-service/index.js'
import { verifyCheckin } from './services/check-in-service/index.js'
```

Luồng kiểm tra đăng nhập khi khởi động:

```text
main.jsx render App
        ↓
App được mount
        ↓
useEffect trong App chạy
        ↓
getCurrentUser() gọi API kiểm tra phiên đăng nhập
        ↓
API thành công: setUser(account)
API thất bại: setUser(null)
        ↓
App render lại theo trạng thái người dùng
```

Sau khi xác định người dùng đã đăng nhập, các effect phụ thuộc vào `user` tiếp tục gọi:

- `getProgress()` để lấy tiến độ check-in.
- `getRewards()` để lấy thông tin phần thưởng.

Do đó, quan hệ trách nhiệm là:

```text
main.jsx
  └── khởi tạo App
        └── App gọi các service
              └── service gửi request đến backend
```

### 6. Dấu phẩy cuối lời gọi `render`

```jsx
</StrictMode>,
)
```

Dấu phẩy sau `</StrictMode>` là trailing comma hợp lệ trong JavaScript hiện đại. Nó không tạo thêm tham số và không thay đổi kết quả. Cách viết này thường được formatter giữ lại để code nhiều dòng dễ chỉnh sửa hơn.

### 7. Các file liên quan

| File | Vai trò |
|---|---|
| `frontend/index.html` | Tạo `#root` và tải `main.jsx` |
| `frontend/src/main.jsx` | Khởi tạo React, provider ngôn ngữ và CSS toàn cục |
| `frontend/src/i18n/LanguageContext.jsx` | Quản lý ngôn ngữ và cung cấp hàm `t()` |
| `frontend/src/App.jsx` | Quản lý route, đăng nhập, dữ liệu, API và page hiện tại |
| `frontend/src/pages/` | Chứa giao diện của từng màn hình |
| `frontend/src/services/` | Chứa logic giao tiếp với backend API |

### 8. Kết luận

`main.jsx` không chứa nghiệp vụ của dự án. Nó là điểm nối giữa `index.html` và React, đồng thời dựng môi trường chung để `App.jsx` cùng toàn bộ component phía dưới hoạt động.
