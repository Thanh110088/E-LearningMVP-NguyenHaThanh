# 05. Hướng Dẫn Khởi Chạy Dự Án ETech (Getting Started)

## 1. Yêu cầu môi trường
- **Node.js**: Phiên bản >= 18.x
- **PostgreSQL**: Ứng dụng PostgreSQL chạy trực tiếp trên máy tính (Port 5432).
- **Database URL**: `postgresql://postgres:123456@localhost:5432/elearning_db?schema=public`

---

## 2. Các bước cài đặt & Chạy dự án (1-Click Command)

### Bước 1: Cài đặt và khởi tạo dữ liệu
```bash
npm run setup
```
Lệnh này sẽ thực thi đồng bộ Prisma Schema (bảng `users`, `subscriptions`, `exams`...) và seed đầy đủ dữ liệu mẫu ban đầu.

### Bước 2: Chạy ứng dụng ETech
```bash
npm run dev
```
- **Frontend ETech**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5050`
- **Swagger Documentation**: `http://localhost:5050/api-docs`
- **Prisma Studio GUI (Xem database)**: `npx prisma studio --schema=backend/prisma/schema.prisma`

---

## 3. Auth (cookie + email + Google)

Tài khoản seed đã `emailVerified=true`, đăng nhập ngay được.

Tài khoản đăng ký mới phải xác nhận email (kiểm tra SMTP hoặc log backend nếu chưa cấu hình SMTP).

```bash
cp backend/.env.example backend/.env
# Bắt buộc: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
# Khuyến nghị: JWT_EXPIRES_IN=15m
# Tuỳ chọn: GOOGLE_CLIENT_ID, SMTP_* , FRONTEND_URL

cp frontend/.env.example frontend/.env
# Tuỳ chọn: VITE_GOOGLE_CLIENT_ID
```

Chi tiết: `docs/08-auth-base.md`  
Báo cáo: `docs/BAO_CAO_AUTH_BASE.md`

Chạy test:

```bash
npm test
```
