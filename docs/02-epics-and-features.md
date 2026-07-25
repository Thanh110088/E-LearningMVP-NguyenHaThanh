# 02. Epics & Tính Năng Hệ Thống (Epics & Features)

Chi tiết các Epic và danh sách tính năng đã được triển khai trọn vẹn trong hệ thống:

---

## Epic 1: Quản Lý Tài Khoản & Phân Quyền (Auth & Users)
- **Đăng ký / Đăng nhập**: Xác thực JWT Access Token & Refresh Token an toàn.
- **Phân quyền Role-based**: ADMIN, TEACHER, STUDENT.
- **Thông tin cá nhân**: API `/api/v1/auth/me` tự động khôi phục phiên làm việc.

---

## Epic 2: Quản Lý Danh Mục (Categories)
- **Môn Học (Subject)**: Quản lý mã môn, tên môn học (Toán, Tiếng Anh, Vật Lý...).
- **Khối Lớp (Grade)**: Quản lý khối lớp (Khối 10, Khối 12...).

---

## Epic 3: Ngân Hàng Câu Hỏi & Đề Thi (Question Bank & Exams)
- **Ngân hàng câu hỏi**:
  - Hỗ trợ loại câu hỏi: Single Choice (Một đáp án), Multiple Choice (Nhiều đáp án), True/False (Đúng/Sai).
  - Cấu hình độ khó (Dễ, Trung bình, Khó), điểm số và lời giải chi tiết (Explanation).
- **Quản lý đề thi**:
  - Cấu hình mã đề, tiêu đề, thời gian làm bài (phút), tổng điểm và điểm đạt.
  - Quản lý trạng thái đề thi: `DRAFT` (Nháp) vs `PUBLISHED` (Xuất bản).

---

## Epic 4: Engine Làm Bài & Chấm Điểm Tự Động (Exam Engine)
- **Khám phá đề thi**: Lọc đề thi theo môn học, khối lớp và từ khóa tìm kiếm.
- **Phòng thi trực tuyến**: Đồng hồ đếm ngược (Countdown Timer), bảng điều hướng danh sách câu hỏi, lưu lựa chọn tạm thời và tự động nộp bài khi hết giờ.
- **Thuật toán chấm điểm tự động**: Chấm điểm chính xác theo loại câu hỏi và tổng hợp kết quả ĐẠT / KHÔNG ĐẠT.
- **Xem lại bài làm**: Hiển thị kết quả chi tiết, lựa chọn của học sinh, đáp án đúng và lời giải giải thích.

---

## Epic 5: Live Room, Dashboard & Bảng Xếp Hạng
- **Phòng thi Live (Mã PIN)**: Học sinh nhập mã PIN 6 ký tự để tham gia thi trực tiếp.
- **Dashboard Thống kê**: Thẻ chỉ số tổng quan, biểu đồ Recharts tỷ lệ Đạt/Không đạt và bảng lịch sử làm bài gần đây.
- **Bảng Xếp Hạng (Leaderboard)**: Bục vinh danh Top 1, 2, 3 và danh sách thứ hạng học sinh điểm cao nhất.

---

## Epic 6: Báo Cáo & Audit Log
- **Báo cáo & Export CSV**: Xem danh sách kết quả làm bài và xuất file CSV `elearning-submissions-report.csv`.
- **Nhật ký Audit Log**: Theo dõi lịch sử thao tác người dùng, thời gian và địa chỉ IP dành cho Admin.
