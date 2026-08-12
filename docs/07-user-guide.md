# 07. Hướng Dẫn Sử Dụng Chi Tiết ETech (User Guide)

Tài liệu này hướng dẫn chi tiết từng bước sử dụng toàn bộ 6 tính năng cốt lõi ETech trong hệ thống:

---

## I. Chi Tiết 6 Tính Năng Cốt Lõi ETech

### 1. ⚡ Dễ Dùng Cho Giáo Viên (Import từ Word `.docx`)
- Giáo viên truy cập **Ngân hàng câu hỏi** (`/questions`) ➔ Bấm nút **"📄 Import Từ Word"**.
- Dán nội dung đề thi từ Word hoặc văn bản theo cấu trúc:
  ```text
  Câu 1: Hàm số $y = x^2$ đồng biến trên khoảng nào?
  A. (-∞; 0)
  B. (0; +∞)*
  C. R
  D. (-∞; +∞)
  ```
- Nhấn **"Bóc Tách Nội Dung"** để xem trước câu hỏi và đáp án ➔ Nhấn **"Lưu Câu Hỏi Vào Hệ Thống"** để tạo siêu tốc hàng chục câu hỏi trong vài giây.

---

### 2. ⏱️ Thi Realtime (Tự Động Lưu Nháp LocalStorage & Countdown Timer)
- Trong quá trình làm bài thi trực tuyến (`/exams/:id/take`), hệ thống tự động lưu nháp từng câu trả lời đã chọn vào `localStorage`.
- Nếu bị rớt mạng, lỡ tay bấm F5 hoặc đóng trình duyệt, đáp án đã chọn được khôi phục 100%.
- Đồng hồ đếm ngược hiển thị thời gian còn lại. Khi hết giờ (`00:00`), hệ thống tự động nộp bài và chuyển đến trang xem kết quả.

---

### 3. 🛡️ Chống Gian Lận (Cảnh Báo Chuyển Tab)
- Trong khi làm bài thi, nếu học sinh mở tab mới, thu nhỏ màn hình hoặc rời khỏi trang thi:
  - Hệ thống phát hiện sự kiện `visibilitychange` và đếm số lần vi phạm.
  - Hiển thị Banner màu đỏ cảnh báo trực tiếp: *"⚠️ CẢNH BÁO GIAN LẬN: Bạn đã rời khỏi màn hình thi X lần. Số lần vi phạm quy chế thi này sẽ được ghi nhận vào hệ thống!"*
  - Số lần chuyển tab được đính kèm vào lịch sử lượt nộp bài để Giáo viên/Admin kiểm tra.

---

### 4. 📐 Hỗ Trợ LaTeX (Hiển Thị Công Thức Toán / Lý / Hóa)
- Hệ thống hỗ trợ công thức Toán, Lý, Hóa dạng KaTeX:
  - Công thức dòng: `$y = x^2$`, `$\\frac{a}{b}$`, `$\\sqrt{x}$`.
  - Công thức khối: `$$E = mc^2$$`.
- Trình bày trực quan, đẹp mắt và sắc nét trên toàn bộ các câu hỏi và đáp án.

---

### 5. 🏆 Bảng Xếp Hạng (Realtime Leaderboard)
- Truy cập `/leaderboard`: Vinh danh học sinh có điểm số cao nhất, số lượt hoàn thành bài thi và thời gian làm bài nhanh nhất.

---

### 6. 👥 Multi-Workspace
- Phân chia không gian riêng cho từng giảng viên, quản lý câu hỏi và đề thi theo từng môn học/lớp học độc lập.
