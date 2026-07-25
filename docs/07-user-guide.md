# 07. Hướng Dẫn Sử Dụng Chi Tiết (User Guide)

Tài liệu này hướng dẫn chi tiết từng bước sử dụng các tính năng trong hệ thống E-Learning & Quiz System dành cho **Giáo viên / Admin** và **Học sinh**.

---

## I. Tài khoản mặc định sẵn có trong hệ thống

Sau khi chạy lệnh `npm run setup` hoặc `npm run seed`, hệ thống đã có sẵn 3 tài khoản thử nghiệm:

| Vai trò (Role) | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@elearning.com` | `Admin123456` | Toàn quyền quản trị hệ thống, môn học, xem Audit Log, Dashboard, Reports. |
| **TEACHER** | `teacher@elearning.com` | `Teacher123456` | Tạo câu hỏi, quản lý đề thi, xuất bản đề thi, xem Dashboard & Báo cáo. |
| **STUDENT** | `student@elearning.com` | `Student123456` | Làm bài thi trực tuyến, vào thi bằng mã PIN Live, xem kết quả & Bảng xếp hạng. |

---

## II. Hướng dẫn dành cho Giáo viên / Admin (Tạo câu hỏi & Tạo đề thi)

### 1. Hướng dẫn tạo và quản lý Ngân Hàng Câu Hỏi
1. **Đăng nhập** bằng tài khoản Giáo viên (`teacher@elearning.com`) hoặc Admin.
2. Trên thanh menu trên cùng, nhấn vào mục **"Ngân Hàng Câu Hỏi"** (hoặc truy cập đường dẫn `/questions`).
3. Để tạo câu hỏi mới:
   - Nhấn nút **"+ Thêm Câu Hỏi Mới"** ở góc phải trên.
   - **Chọn Môn học** (VD: Toán Học, Tiếng Anh, Vật Lý...).
   - **Chọn Loại câu hỏi**:
     - *Một đáp án (Single choice)*: Chọn 1 nút tròn đúng.
     - *Nhiều đáp án (Multiple choice)*: Chọn nhiều đáp án đúng.
     - *Đúng / Sai (True/False)*: Đáp án Đúng hoặc Sai.
   - **Chọn Độ khó** (Dễ, Trung bình, Khó) và **Điểm số** (mặc định 1.0 - 5.0 điểm).
   - **Nhập Nội dung câu hỏi** và **Nội dung các đáp án (Phương án A, B, C, D...)**.
   - Nhấn vào biểu tượng **dấu tích màu xanh** bên cạnh đáp án để đánh dấu đáp án đó là **ĐÚNG**.
   - (Tùy chọn) Nhập **Lời giải chi tiết** để học sinh xem lại sau khi nộp bài.
   - Nhấn nút **"Tạo Câu Hỏi"**.
4. Quản lý: Có thể lọc danh sách câu hỏi theo môn học, độ khó hoặc nhấn nút **Sửa / Xóa** từng câu hỏi.

---

### 2. Hướng dẫn Tạo Đề Thi & Xuất Bản Đề Thi
1. Trên thanh menu, nhấn vào mục **"Đề Thi"** (hoặc truy cập `/manage-exams`).
2. Nhấn nút **"+ Tạo Đề Thi Mới"**.
3. Nhập thông tin đề thi:
   - **Tên đề thi**: VD "Đề Kiểm Tra Giữa Kỳ I Môn Toán Lớp 10".
   - **Mã đề thi**: VD `EXAM-MATH-10-01`.
   - **Chọn Môn học & Khối lớp**.
   - **Thời gian làm bài (Phút)**: VD 45 phút hoặc 90 phút.
   - **Tổng điểm & Điểm đạt**: VD Tổng 10 điểm, Điểm đạt 5.0 điểm.
   - **Trạng thái**: Chọn `DRAFT` (Bản nháp) hoặc `PUBLISHED` (Xuất bản).
   - **Nhập Mô tả chi tiết** đề thi.
4. Nhấn **"Tạo Đề Thi"**.
5. **Xuất bản đề thi**: Bạn có thể nhấn trực tiếp vào nút Badge trạng thái (`DRAFT` / `PUBLISHED`) trên thẻ đề thi để nhanh chóng chuyển đổi trạng thái cho phép học sinh vào làm bài.

---

### 3. Xem Dashboard Thống Kê & Báo Cáo Xuất CSV
- **Dashboard**: Nhấn vào **"Dashboard"** trên thanh menu (`/dashboard`) để xem tổng số câu hỏi, đề thi, lượt nộp bài, tỷ lệ phần trăm sinh viên ĐẠT/KHÔNG ĐẠT (biểu đồ Recharts).
- **Xuất Báo cáo CSV**: Vào mục **"Báo Cáo"** (`/reports`) -> Nhấn nút **"Xuất File CSV"** để tải file `elearning-submissions-report.csv` mở bằng Excel.
- **Audit Log (Dành cho Admin)**: Đăng nhập `admin@elearning.com` -> Nhấn nút **"Audit Log"** (`/audit-logs`) để xem lịch sử hành động và địa chỉ IP.

---

## III. Hướng dẫn dành cho Học sinh (Làm bài thi & Thi Live PIN)

### 1. Hướng dẫn Khám phá & Làm Bài Thi Trực Tuyến
1. Đăng nhập tài khoản Học sinh (`student@elearning.com`).
2. Tại trang **"Khám Phá Đề Thi"** (`/`):
   - Sử dụng ô tìm kiếm hoặc bộ lọc **Môn học / Khối lớp** để chọn đề thi mong muốn.
   - Nhấn vào thẻ đề thi để xem thông tin chi tiết (Thời gian, số câu hỏi, điểm đạt...).
3. Nhấn nút **"Bắt Đầu Làm Bài"**:
   - Hệ thống sẽ chuyển vào **Phòng thi trực tuyến** (`/exams/:id/take`).
   - **Đồng hồ đếm ngược** ở góc trên sẽ bắt đầu chạy realtime.
   - Chọn đáp án cho từng câu hỏi (chế độ chọn 1 đáp án hoặc chọn nhiều đáp án).
   - Nhìn vào **Bảng danh sách câu hỏi** bên phải để xem các câu đã làm (tô màu xanh).
   - Khi hoàn thành, nhấn nút **"Nộp Bài Thi"** (hoặc nếu hết giờ làm bài hệ thống sẽ tự nộp bài).
4. **Xem kết quả & Lời giải chi tiết**:
   - Hệ thống lập tức chấm điểm tự động và chuyển sang màn hình **Kết Quả** (`/submissions/:id/result`).
   - Hiển thị điểm số lớn, cờ **ĐẠT (PASSED)** hoặc **KHÔNG ĐẠT (FAILED)**.
   - Cuộn xuống dưới để xem chi tiết từng câu: Đáp án bạn đã chọn, Đáp án đúng của hệ thống và **Lời giải chi tiết**.

---

## 2. Hướng dẫn Tham Gia Phòng Thi Live Bằng Mã PIN
1. Khi giáo viên tổ chức một buổi thi trực tiếp và cung cấp cho bạn một **Mã PIN** (VD: `EXAM-THPT-MATH-01`).
2. Trên thanh menu, nhấn vào mục màu đỏ **"Live PIN"** (hoặc truy cập `/live`).
3. Nhập mã PIN vào ô giữa màn hình và nhấn **"Vào Phòng Thi Ngay"**.
4. Hệ thống sẽ kiểm tra mã PIN và đưa bạn trực tiếp vào phòng thi trực tuyến.

---

## 3. Xem Bảng Xếp Hạng (Leaderboard)
- Nhấn vào mục **"Bảng Xếp Hạng"** trên menu (`/leaderboard`).
- Xem bục vinh danh Top 1, Top 2, Top 3 học sinh có điểm số cao nhất và thời gian làm bài xuất sắc nhất toàn hệ thống.
