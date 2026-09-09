# 04. Kiến Trúc Hệ Thống ETech (System Architecture)

## 1. Môi trường & Công nghệ sử dụng

| Tầng hệ thống | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, JavaScript (ES6+), React Router v6, Axios, TanStack Query, Recharts, Lucide React, Tailwind CSS |
| **Backend REST API** | Node.js, Express.js, Prisma ORM, JWT cookie (httpOnly) + refresh rotation, bcryptjs, Google Auth Library, Nodemailer, Zod, Multer |
| **Database** | PostgreSQL (Ứng dụng chạy trực tiếp trên máy local, mặc định cổng 5432) |
| **Testing** | Jest + Supertest (Backend Integration Testing) |

---

## 2. Mô hình Kiến trúc Backend & Subscription Module
```text
HTTP Request
     │
     ▼
[ Routes ] ───────> Nơi định tuyến API (/api/v1/subscription, /api/v1/exams, ...)
     │
     ▼
[ Controller ] ───> Tiếp nhận tham số Request, trả về JSON chuẩn sendSuccess
     │
     ▼
[ Service ] ──────> Xử lý Business Logic, kiểm tra giới hạn gói Free/Pro/Enterprise
     │
     ▼
[ Repository ] ───> Truy vấn CSDL PostgreSQL qua Prisma ORM
     │
     ▼
[ PostgreSQL DB ] (Các bảng users, subscriptions, exams, questions, submissions...)
```

---

## 3. Cấu trúc bảng Database (Prisma Schema Summary)
- `users`: Quản lý người dùng, vai trò, gói cước, `emailVerified`, `googleId`, `provider` (LOCAL/GOOGLE).
- `refresh_tokens`: Hash refresh token, phục vụ rotation và logout.
- `email_tokens`: Token xác nhận email / đặt lại mật khẩu (hash SHA-256).
- `subscriptions`: Quản lý lịch sử đăng ký & giao dịch nâng cấp gói cước (`userId`, `plan`, `amount`, `paymentMethod`, `status`, `expiresAt`).
- `subjects`: Danh mục môn học.
- `grades`: Danh mục khối lớp (THPT, THCS, TIỂU HỌC).
- `exams`: Thông tin đề thi, thời gian, điểm số, mã PIN, trạng thái (`DRAFT`/`PUBLISHED`).
- `questions`: Ngân hàng câu hỏi (nội dung, loại câu hỏi, độ khó, điểm số, lời giải).
- `options`: Các đáp án lựa chọn và cờ `isCorrect`.
- `submissions`: Kết quả lượt thi của học sinh.
- `audit_logs`: Nhật ký theo dõi hoạt động người dùng.
