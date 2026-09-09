# 02. Danh Sách Epics & Tính Năng ETech (Epics & Features)

### 1. Epic 0: Auth Base (Password, Google, Email)
- **FE-0.1**: Login/Register cookie-based, Google Identity Services, quên/đặt lại mật khẩu, xác nhận email, đổi mật khẩu (`/profile`).
- **BE-0.1**: Cookie httpOnly access/refresh, email verify/reset/change-notify, Google ID token, handleAsync, validBodyRequest + Zod, error handler tập trung.
- **FE-1.1**: Header ETech đa kênh (`Trang chủ`, `Khám phá`, `Bảng giá`, `Live PIN`, User Plan Pill).
- **FE-1.2**: Trang chủ Home Page (Hero section, 3 nút hành động, 6 thẻ tính năng).
- **FE-1.3**: Trang Bảng giá Pricing Page (3 gói cước Free, Pro 99k, Enterprise + Bảng so sánh).
- **FE-1.4**: Modal nâng cấp gói cước UpgradeModal (Quét mã VietQR/MoMo, nâng cấp tài khoản tức thì lên Pro/Enterprise).
- **BE-1.1**: Module Subscription API (`GET /my-plan`, `POST /upgrade`, `GET /history`).

---

### 2. Epic 2: Khám Phá & Bộ Lọc Thư Viện Đề Thi (Explore Catalog 3 Cột)
- **FE-2.1**: Giao diện Thư viện đề thi 3 cột (Sidebar lọc môn học/lớp, Grid đề thi giữa, Top 5 Đề thi phổ biến bên phải).
- **FE-2.2**: Tìm kiếm thông minh theo từ khóa đề thi và tên giáo viên.

---

### 3. Epic 3: Ngân Hàng Câu Hỏi & Quản Lý Đề Thi (Question Bank & Exam Management)
- **FE-3.1**: Ngân hàng câu hỏi trắc nghiệm (Single choice, Multiple choice, True/False).
- **FE-3.2**: Modal gán siêu tốc câu hỏi vào đề thi.
- **BE-3.1**: Kiểm tra hạn mức tạo đề/câu hỏi theo gói cước (Free: 10 đề / 200 câu; Pro: 100 đề / 5000 câu).

---

### 4. Epic 4: Engine Thi Trực Tuyến & Live Room PIN Engine
- **FE-4.1**: Phòng thi đếm ngược đếm giờ realtime, tự động nộp bài khi hết giờ.
- **FE-4.2**: Live Room PIN Engine hỗ trợ học sinh thi trực tiếp bằng mã PIN 6 ký tự.
- **BE-4.1**: Thuật toán chấm điểm tự động & trả kết quả kèm lời giải chi tiết.

---

### 5. Epic 5: Analytics Dashboard, Báo Cáo & Audit Logs
- **FE-5.1**: Dashboard thống kê tỷ lệ phần trăm sinh viên Đạt/Không đạt qua biểu đồ Recharts.
- **FE-5.2**: Xuất báo cáo điểm thi định dạng file CSV.
- **FE-5.3**: Nhật ký theo dõi hoạt động hệ thống Audit Log dành cho Admin.
