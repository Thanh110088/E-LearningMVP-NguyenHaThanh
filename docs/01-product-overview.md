# 01. Tổng Quan Sản Phẩm ETech (Product Overview)

## 1. Giới thiệu sản phẩm
**ETech** là Nền tảng thi trắc nghiệm trực tuyến thông minh hàng đầu cho Giáo viên, Học sinh và các Cơ sở giáo dục tại Việt Nam. Sản phẩm thay thế các phương pháp thi giấy truyền thống và Google Forms bằng trải nghiệm thi trực tuyến mượt mà, chống gian lận, đếm ngược đếm giờ realtime, chấm điểm tự động, mô hình **Subscription (Free, Pro, Enterprise)** và phân hệ **ETech Admin Panel** chuyên nghiệp.

---

## 2. Phân Quyền Vai Trò & Cá Nhân Hóa Chức Năng (Role Restrictions)

Hệ thống cá nhân hóa các tính năng đúng với từng vai trò người dùng:

- **STUDENT (Học sinh)**:
  - Xem danh mục đề thi, tìm kiếm đề thi.
  - Làm bài thi trực tuyến (`/exams/:id/take`), tham gia phòng thi Live bằng mã PIN 6 ký tự (`/live`).
  - Xem kết quả chi tiết, đáp án giải thích và Bảng xếp hạng vinh danh.
- **TEACHER (Giáo viên)**:
  - Tạo và quản lý ngân hàng câu hỏi, tạo đề thi, xuất bản đề thi (`/manage-exams`).
  - Tạo phòng thi Live PIN, theo dõi Dashboard thống kê, xuất báo cáo điểm CSV.
  - **CHẶN VÀO THI**: Nút "Vào thi" được đổi thành "Quản lý đề thi". Nút bắt đầu làm bài bị khóa kèm thông báo: *"Tài khoản Giáo viên chỉ có quyền quản lý, không được làm bài thi của học sinh."*
- **ADMIN (Quản trị viên Super Admin)**:
  - Quản trị toàn bộ phân hệ **ETech Admin Panel** (`/admin/*`).
  - **CHẶN VÀO THI**: Nút bắt đầu làm bài bị khóa kèm thông báo: *"Tài khoản Admin chỉ có quyền quản lý hệ thống, không được làm bài thi."*

---

## 3. Phân Hệ ETech Admin Panel (`/admin/*`) *(Khớp 5 Thiết Kế)*

1. **Tổng Quan (`/admin/dashboard`)**: 4 thẻ KPI (Tổng người dùng, Giảng viên, Workspace, Lượt thi), Hoạt động gần đây và Workspace hoạt động nhất.
2. **Quản Lý Người Dùng (`/admin/users`)**: Bảng tìm kiếm, lọc vai trò, đổi vai trò người dùng (Student/Teacher/Admin) và Khóa/Mở khóa tài khoản 🔒.
3. **Quản Lý Giảng Viên (`/admin/teachers`)**: Bảng quản lý giảng viên, đổi gói dịch vụ (`Free` / `Pro` / `Enterprise`) và theo dõi số lượng đề/câu đã tạo.
4. **Quản Lý Môn Học (`/admin/subjects`)**: Bảng danh sách môn học (Slug, tên môn, số đề thi, thao tác Sửa/Xóa) và Form bên phải `+ Tạo môn học mới`.
5. **Doanh Thu & Gói Dịch Vụ (`/admin/revenue`)**: Thống kê số lượng tài khoản Free vs Pro và chỉ số **MRR ước tính**.
