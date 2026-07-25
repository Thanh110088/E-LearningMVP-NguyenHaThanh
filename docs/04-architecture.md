# 04. Kiến Trúc Hệ Thống (System Architecture)

## 1. Môi trường & Công nghệ sử dụng

| Tầng hệ thống | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, JavaScript (ES6+), React Router v6, Axios, TanStack Query, Recharts, Lucide React, Tailwind CSS |
| **Backend REST API** | Node.js, Express.js, Prisma ORM, JWT (jsonwebtoken), bcryptjs, Multer |
| **Database** | PostgreSQL (Ứng dụng chạy trực tiếp trên máy local, mặc định cổng 5432) |
| **Testing** | Jest + Supertest (Backend Integration Testing) |

---

## 2. Mô hình Kiến trúc Backend (Layered Architecture)
Hệ thống Backend được thiết kế theo phân lớp rõ ràng nhằm phân tách trách nhiệm:
```text
HTTP Request
     │
     ▼
[ Routes ] ───────> Nơi định tuyến và áp dụng Middleware (Auth, Authorize)
     │
     ▼
[ Controller ] ───> Tiếp nhận tham số Request, trả về JSON thành công/lỗi
     │
     ▼
[ Service ] ──────> Xử lý toàn bộ Business Logic & Thuật toán chấm điểm tự động
     │
     ▼
[ Repository ] ───> Thực thi truy vấn dữ liệu qua Prisma ORM
     │
     ▼
[ PostgreSQL DB ]
```

---

## 3. Cấu trúc bảng Database (Prisma Schema Summary)
- `users`: Quản lý người dùng, vai trò (ADMIN, TEACHER, STUDENT).
- `subjects`: Danh mục môn học.
- `grades`: Danh mục khối lớp.
- `exams`: Thông tin đề thi, thời gian, điểm số, mã PIN, trạng thái (DRAFT/PUBLISHED).
- `questions`: Ngân hàng câu hỏi (nội dung, loại câu hỏi, độ khó, điểm số, lời giải).
- `options`: Các đáp án lựa chọn và cờ `isCorrect`.
- `submissions`: Kết quả lượt thi của học sinh, điểm số, trạng thái (IN_PROGRESS/COMPLETED), kết quả ĐẠT/KHÔNG ĐẠT và lưu câu trả lời JSON.
- `audit_logs`: Nhật ký theo dõi hoạt động người dùng.
