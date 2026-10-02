# Báo cáo đo hiệu năng — Explore Văn Miếu

Ngày đo (UTC): 2026-09-30T08:20:24.430999+00:00. Số liệu thực đo cục bộ, không phải số liệu minh họa.

## 1. Điều kiện và phương pháp

- Máy: Windows-11-10.0.26200-SP0; CPU: Intel64 Family 6 Model 140 Stepping 1, GenuineIntel; 8 CPU logic.
- Python 3.12.10; trình duyệt Chrome/154.0.8037.58.
- Frontend: production build; backend: Uvicorn 1 worker, SQLite trên ổ đĩa. HTTP loopback, không giả lập mạng chậm hoặc CPU chậm.
- Máy phát tải, máy chủ và trình duyệt dùng cùng một máy. Không suy rộng trực tiếp thành năng lực máy chủ production.
- Dữ liệu riêng: 100 tài khoản, 10 địa điểm, 5 dấu và 5 log check-in/tài khoản. Không dùng dữ liệu khách thật.
- Cookie JWT được cấp trước phép đo; có xác thực thật trên API, không đo chi phí đăng nhập/Argon2.
- Bốn GET API được gọi luân phiên với tỷ lệ gần bằng nhau: tài khoản, địa điểm, tiến độ, lịch sử check-in.
- Các mức tải: [1, 5, 10, 25, 50, 100]. Mỗi mức lặp 3 lần, 10 giây/lần; làm nóng trước mỗi lượt.
- Mỗi người dùng ảo có tài khoản riêng, tối đa một yêu cầu đang chờ, gửi tiếp ngay khi có kết quả (closed-loop, không think time). Đây là tác vụ API đồng thời, không phải số người mở trình duyệt.
- Độ trễ đo từ phía client đến khi nhận và kiểm tra xong phản hồi. Lỗi = timeout/lỗi kết nối, HTTP khác 200 hoặc nội dung phản hồi sai kỳ vọng. P95/P99 dùng nearest-rank.
- RPS = tổng yêu cầu / thời gian thực tế, gồm thời gian chờ các yêu cầu cuối hoàn tất. Percentile tính trên toàn bộ yêu cầu, kể cả lỗi.

## 2. Thời gian tải trang trong trình duyệt

Chrome/Edge headless, viewport 1365 × 900; mỗi trang 5 lần điều hướng đầy đủ, xóa cache trình duyệt trước mỗi lần, đã đăng nhập. Máy chủ/OS đã được làm nóng. Đo khi không chạy thử tải API.

| Trang | Số mẫu | TTFB trung vị (ms) | FCP trung vị (ms) | DOMContentLoaded trung vị (ms) | Load trung vị (ms) | Load lớn nhất (ms) |
|---|---:|---:|---:|---:|---:|---:|
| /Explore | 5 | 7.30 | 540.00 | 293.90 | 303.00 | 344.90 |
| /Explore/Cong-Trinh | 5 | 6.10 | 526.00 | 384.50 | 387.00 | 639.90 |
| /Explore/Ho-Chieu | 5 | 6.40 | 620.00 | 454.10 | 456.30 | 468.90 |

TTFB: byte đầu tiên của tài liệu HTML. FCP: nội dung đầu tiên được vẽ. Load: sự kiện tải tài liệu và tài nguyên chặn load; không đồng nghĩa mọi ảnh lazy-load, API bất đồng bộ hoặc toàn bộ màn hình đã sẵn sàng. Không đo LCP/INP/Core Web Vitals hay bản đồ ngoài mạng trong đợt này.
Lỗi JavaScript/tài nguyên ghi nhận trong các mẫu: 0.

## 3. Kết quả khi tăng tải API

| Người dùng ảo | Yêu cầu | RPS | TB (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Lỗi | Tỷ lệ lỗi |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 3332 | 111.02 | 9.0 | 8.69 | 13.73 | 15.74 | 0 | 0.0% |
| 5 | 4801 | 159.71 | 31.27 | 29.78 | 52.75 | 68.36 | 0 | 0.0% |
| 10 | 4376 | 145.26 | 68.67 | 47.91 | 196.95 | 359.75 | 0 | 0.0% |
| 25 | 3691 | 121.39 | 204.72 | 115.63 | 643.77 | 1008.87 | 0 | 0.0% |
| 50 | 3253 | 105.18 | 467.48 | 312.27 | 1404.24 | 2137.56 | 0 | 0.0% |
| 100 | 2976 | 90.57 | 1054.42 | 802.91 | 3041.66 | 4282.67 | 0 | 0.0% |

### Chi tiết từng API ở từng mức tải

| Người dùng ảo | API | Yêu cầu | P50 (ms) | P95 (ms) | Lỗi (%) |
|---:|---|---:|---:|---:|---:|
| 1 | `/api/auth/me` | 834 | 7.36 | 11.19 | 0.0 |
| 1 | `/api/locations` | 834 | 9.53 | 14.29 | 0.0 |
| 1 | `/api/progress` | 833 | 8.73 | 13.09 | 0.0 |
| 1 | `/api/checkins/history` | 831 | 9.33 | 14.22 | 0.0 |
| 5 | `/api/auth/me` | 1202 | 25.99 | 44.34 | 0.0 |
| 5 | `/api/locations` | 1202 | 32.47 | 58.45 | 0.0 |
| 5 | `/api/progress` | 1198 | 29.89 | 50.76 | 0.0 |
| 5 | `/api/checkins/history` | 1199 | 30.3 | 51.57 | 0.0 |
| 10 | `/api/auth/me` | 1095 | 44.93 | 203.92 | 0.0 |
| 10 | `/api/locations` | 1092 | 50.91 | 172.54 | 0.0 |
| 10 | `/api/progress` | 1095 | 48.7 | 231.34 | 0.0 |
| 10 | `/api/checkins/history` | 1094 | 47.68 | 179.34 | 0.0 |
| 25 | `/api/auth/me` | 926 | 112.31 | 612.66 | 0.0 |
| 25 | `/api/locations` | 922 | 117.42 | 665.42 | 0.0 |
| 25 | `/api/progress` | 924 | 110.98 | 606.22 | 0.0 |
| 25 | `/api/checkins/history` | 919 | 120.2 | 668.03 | 0.0 |
| 50 | `/api/auth/me` | 813 | 298.91 | 1480.09 | 0.0 |
| 50 | `/api/locations` | 813 | 328.35 | 1422.65 | 0.0 |
| 50 | `/api/progress` | 811 | 312.14 | 1409.66 | 0.0 |
| 50 | `/api/checkins/history` | 816 | 302.74 | 1310.01 | 0.0 |
| 100 | `/api/auth/me` | 752 | 838.5 | 3029.39 | 0.0 |
| 100 | `/api/locations` | 752 | 839.77 | 3249.51 | 0.0 |
| 100 | `/api/progress` | 731 | 818.96 | 3054.2 | 0.0 |
| 100 | `/api/checkins/history` | 741 | 760.35 | 2799.87 | 0.0 |

## 4. Nhận xét và giới hạn

- Khi tăng từ 1 lên 100 người dùng ảo, P95 thay đổi từ 13.73 ms thành 3041.66 ms; throughput từ 111.02 lên 90.57 request/giây.
- Ở mức cao nhất đã thử: 0/2976 yêu cầu lỗi (0.0%). Đây không phải bằng chứng về số người dùng tối đa hay độ ổn định dài hạn.
- Đây là thử tải tăng dần ngắn hạn. Chưa xác định điểm sập hệ thống, chưa thử tải kéo dài hoặc khả năng phục hồi sau quá tải.
- Không đo upload ảnh, ghi check-in, AI vision/chat, đăng ký/đăng nhập, nhiều dữ liệu lịch sử, HTTPS hoặc mạng di động. Các phần này cần phép đo riêng.
- Không có baseline trước tối ưu nên không kết luận tối ưu đã làm nhanh hơn bao nhiêu. Không tự gán ngưỡng đạt/rớt khi đề bài chưa quy định SLA.
- Cần chạy lại trên máy triển khai, tách máy phát tải và đo ít nhất vài phút/mức để dùng cho quyết định năng lực production.

## 5. Dữ liệu gốc và cách chạy lại

- `raw-results.json`: từng yêu cầu (độ trễ, mã HTTP, API, mức tải, lượt chạy), mẫu trình duyệt, môi trường và thống kê từng lượt. Không chứa cookie hoặc khóa bí mật.
- Công cụ: `scripts/benchmark.py`. Tạo database và hồ sơ trình duyệt riêng trong `.local-test/`; dừng máy chủ thử nghiệm sau khi đo.

Chạy từ thư mục gốc dự án (PowerShell):

```powershell
npm --prefix frontend run build
backend\.venv\Scripts\python.exe scripts/benchmark.py --duration 10 --repeats 3 --levels 1 5 10 25 50 100
```

Cần các thư viện backend và `websockets`, Chrome hoặc Edge. Có thể đặt biến `BENCHMARK_BROWSER` tới trình duyệt nếu không nằm ở vị trí mặc định. Mỗi lần chạy tạo thư mục báo cáo mới.
