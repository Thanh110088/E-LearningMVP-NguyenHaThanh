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
