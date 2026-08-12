# HƯỚNG DẪN CHI TIẾT TỪ A - Z: QUY TRÌNH XÂY DỰNG DỰ ÁN E-LEARNING & THI TRẮC NGHIỆM TRỰC TUYẾN (ETECH SYSTEM)

Tài liệu này tổng hợp toàn bộ lộ trình phát triển một ứng dụng Web E-Learning & Thi trắc nghiệm trực tuyến chuẩn SaaS chuyên nghiệp từ con số 0.

---

## 🏗️ I. CÔNG NGHỆ & KIẾN TRÚC TỔNG THỂ (TECH STACK)

1. **Backend**: Node.js, Express.js (Module-based Architecture).
2. **Database & ORM**: PostgreSQL, Prisma ORM.
3. **Frontend**: React.js (Vite), Vanilla CSS / TailwindCSS (Dark Glassmorphism Design).
4. **Realtime**: Socket.io (Thi đấu trực tuyến / Live Room bằng mã PIN).
5. **Công cụ phụ trợ**:
   - `KaTeX` / `LaTeXRenderer`: Render công thức Toán, Lý, Hóa (`$y = x^2$`, `$\\frac{a}{b}$`).
   - `Mammoth` / `Regex Parser`: Bóc tách tự động file Word `.docx` thành câu hỏi và đáp án.
   - `Audit Log`: Ghi nhận nhật ký thao tác người dùng vào PostgreSQL.

---

## 📋 II. LỘ TRÌNH PHÁT TRIỂN THEO THỨ TỰ CÁC BƯỚC (ROADMAP)

---

### 🔹 BƯỚC 1: Phân Tích Yêu Cầu & Thiết Kế Cơ Sở Dữ Liệu (Database Schema)

**Mục tiêu**: Xây dựng mô hình dữ liệu quan hệ (ERD) trong `prisma/schema.prisma` đại diện cho toàn bộ hệ thống.

**Các bảng dữ liệu chính**:
1. **User**: Quản lý tài khoản, vai trò (`ADMIN`, `TEACHER`, `STUDENT`), gói cước (`FREE`, `PRO`, `ENTERPRISE`).
2. **Subject & Grade**: Quản lý danh mục môn học (Toán, Lý, Hóa, Anh...) và khối lớp (Khối 10, 11, 12...).
3. **Question & Option**: Kho câu hỏi trắc nghiệm (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`), mức độ khó (`EASY`, `MEDIUM`, `HARD`) và danh sách các lựa chọn đáp án.
4. **Exam & ExamQuestion**: Quản lý thông tin đề thi (tiêu đề, mã đề, thời gian làm bài, điểm đạt, trạng thái `DRAFT` / `PUBLISHED`).
5. **Submission**: Ghi nhận lượt làm bài thi của học sinh (điểm số, kết quả `PASSED`/`FAILED`, mảng đáp án chọn, số lần vi phạm chuyển tab `tabSwitchCount`).
6. **Subscription**: Quản lý giao dịch nâng cấp gói dịch vụ SaaS (FREE, PRO, ENTERPRISE, QR Banking).
7. **AuditLog**: Ghi vết các hành động quan trọng (`USER_LOGIN`, `CREATE_EXAM`, `SUBMIT_EXAM`...).
8. **LiveRoom**: Phòng thi trực tuyến theo mã PIN 6 chữ số qua Socket.io.

---

### 🔹 BƯỚC 2: Khởi Tạo Khung Dự Án Monorepo / Workspace

**Thực hiện**:
- Tạo thư mục gốc `E-LearningMVP` chứa 2 workspace độc lập:
  - `backend/`: Chứa Node.js Express API.
  - `frontend/`: Chứa React Vite Single Page Application.
- Thiết lập file `package.json` ở root để chạy đồng thời cả frontend và backend bằng lệnh `npm run dev`.

---

### 🔹 BƯỚC 3: Xây Dựng Hệ Thống Xác Thực & Phân Quyền (Auth & RBAC Middleware)

**Thực hiện**:
1. Cài đặt `bcryptjs` để mã hóa mật khẩu và `jsonwebtoken` (JWT) cho xác thực.
2. Xây dựng Middleware:
   - `auth.middleware.js`: Kiểm tra JWT Token gửi lên từ Header `Authorization: Bearer <token>`.
   - `role.middleware.js`: Kiểm tra quyền truy cập theo vai trò (`STUDENT`, `TEACHER`, `ADMIN`).

---

### 🔹 BƯỚC 4: Xây Dựng Ngân Hàng Câu Hỏi, Công Cụ Import Word & Render Công Thức LaTeX

**Thực hiện**:
1. **CRUD Ngân Hàng Câu Hỏi (`/api/v1/questions`)**: Cho phép tạo, sửa, xóa, lọc câu hỏi theo môn học và độ khó.
2. **Công Cụ Import Đề Thi Từ Word (`WordImportModal.jsx`)**:
   - Xây dựng Bộ lọc Regex thông minh phân tích cú pháp dạng văn bản từ Word:
     ```text
     Câu 1: Hàm số $y = x^2$ đồng biến trên khoảng nào?
     A. (-∞; 0)
     B. (0; +∞)*
     C. R
     D. (-∞; +∞)
     ```
   - Tự động tách câu hỏi, phương án và đáp án đúng (có cờ `*`).
3. **Component Render LaTeX (`LaTeXRenderer.jsx`)**:
   - Render tự động các chuỗi có định dạng toán học `$ ... $` hoặc `$$ ... $$` hiển thị công thức đẹp mắt.

---

### 🔹 BƯỚC 5: Xây Dựng Trình Quản Lý & Xuất Bản Đề Thi (Exam Engine)

**Thực hiện**:
1. Cho phép Giáo viên khởi tạo Đề thi: Tiêu đề, Mã đề, Môn học, Thời gian làm bài (phút), Thang điểm và Điểm đạt.
2. Nút **"Gán Câu Hỏi"**: Cho phép chọn câu hỏi từ Ngân hàng câu hỏi vào Đề thi.
3. Xuất bản đề thi (`PUBLISHED`): Chuyển trạng thái đề thi sang sẵn sàng cho học sinh vào thi.

---

### 🔹 BƯỚC 6: Phát Triển Trình Làm Bài Thi Trực Tuyến (Exam Runner), Auto-Save & Chống Gian Lận

**Thực hiện trên `TakeExamPage.jsx`**:
1. **Đếm Ngược Thời Gian (`Countdown Timer`)**: Đồng hồ tự động nộp bài khi đếm về `00:00`.
2. **Lưu Nháp Tự Động (`LocalStorage Auto-save`)**: Mỗi khi chọn đáp án, ghi lập tức vào `localStorage`. Khi F5/rớt mạng, tự động khôi phục bài thi.
3. **Phát Hiện Gian Lận (`Anti-Cheat Tab Switch`)**:
   - Lắng nghe sự kiện `visibilitychange` & `blur`.
   - Đếm số lần học sinh mở tab khác hoặc thu nhỏ trình duyệt (`tabSwitchCount`).
   - Bật Banner đỏ cảnh báo gian lận và gửi số lần vi phạm về Server lưu vào báo cáo bài nộp.

---

### 🔹 BƯỚC 7: Xây Dựng Phòng Thi Trực Tuyến Realtime Qua Socket.io (Live Exam Room)

**Thực hiện**:
1. Thiết lập Socket.io Server tại Backend (`socket.js`).
2. Giáo viên khởi tạo phòng thi trực tuyến ➔ Hệ thống tạo **Mã PIN 6 chữ số** ngẫu nhiên.
3. Học sinh nhập mã PIN ➔ Tham gia phòng chờ trực tuyến (Lobby).
4. Giáo viên bấm **"Bắt Đầu Thi"** ➔ Đồng bộ câu hỏi realtime cho tất cả học sinh.
5. Học sinh nộp bài ➔ Điểm số cập nhật tức thì trên màn hình Giáo viên.

---

### 🔹 BƯỚC 8: Phát Triển Báo Cáo Điểm Thi, Xuất CSV & Bảng Xếp Hạng (Leaderboard)

**Thực hiện**:
1. **Trang Báo Cáo (`/reports`)**: Hiển thị bảng tổng hợp kết quả lượt thi của tất cả học sinh, điểm số, kết quả PASSED/FAILED, số lần vi phạm chuyển tab.
2. **Xuất File CSV (`/api/v1/reports/export`)**: Tải file CSV báo cáo kết quả thi về máy.
3. **Bảng Xếp Hạng (`/leaderboard`)**: Vinh danh học sinh có điểm cao nhất và thời gian hoàn thành nhanh nhất.

---

### 🔹 BƯỚC 9: Cá Nhân Hóa Vai Trò (Admin Overview, Teacher Workspace, Student Portal)

**Thực hiện**:
1. Tự động điều chỉnh Thanh Menu Header theo vai trò người dùng (`STUDENT`, `TEACHER`, `ADMIN`).
2. Tự động chuyển đổi Trang Chủ (`/`):
   - **ADMIN**: Hiển thị Dashboard quản trị hệ thống, 4 thẻ KPI người dùng/doanh thu, xếp hạng Workspace giảng viên.
   - **TEACHER**: Hiển thị Workspace Giáo viên với các lối tắt Tạo đề thi, Ngân hàng câu hỏi, Báo cáo điểm thi.
   - **STUDENT**: Hiển thị Portal học sinh với Khám phá đề thi, Thi bằng mã PIN, Bảng xếp hạng.

---

### 🔹 BƯỚC 10: Xây Dựng Hệ Thống SaaS Pricing, Nâng Cấp Gói Cước & Audit Log

**Thực hiện**:
1. **Hệ Thống Gói Cước (`/pricing`)**: Quản lý gói FREE (10 đề thi), PRO (100 đề thi, 99k/tháng), ENTERPRISE (Không giới hạn, 499k/tháng).
2. **Thanh Toán QR Banking**: Tự động tạo mã QR VietQR chuyển khoản ngân hàng nâng cấp tài khoản.
3. **Nhật Ký Thao Tác (`AuditLogPage.jsx`)**: Ghi nhận toàn bộ thao tác quan trọng vào database PostgreSQL và hiển thị trang quản trị cho Admin.

---

## 🎯 KẾT LUẬN

Khi thực hiện theo đúng 10 bước trên, bạn sẽ tạo ra một hệ thống **E-Learning & Thi trắc nghiệm trực tuyến hoàn chỉnh, chuyên nghiệp và sẵn sàng thương mại hóa (Production-Ready MVP)** giống như hệ thống ETech hiện tại.
