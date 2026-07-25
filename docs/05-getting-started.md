# Hướng Dẫn Onboarding & Bắt Đầu Nhanh (05-getting-started.md)

Chào mừng bạn đến với dự án **E-Learning & Quiz System**! 

## 1. Yêu cầu môi trường

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **PostgreSQL**: >= 15 (Hoặc chạy qua Docker)

## 2. Các bước cài đặt & chạy ứng dụng

### Bước 1: Khởi chạy Database
Sử dụng Docker Compose để khởi chạy PostgreSQL local:
```bash
npm run docker:up
```

### Bước 2: Cài đặt Dependencies & Khởi tạo Môi trường
```bash
# Cấu hình biến môi trường Backend
cp backend/.env.example backend/.env

# Cài đặt toàn bộ packages (Workspaces backend + frontend) & Sync Schema & Seed dữ liệu
npm run setup
```

### Bước 3: Chạy ứng dụng ở chế độ Chạy Thử (Dev Mode)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5050`
- **Frontend UI**: `http://localhost:5173`
- **Swagger Docs**: `http://localhost:5050/api-docs`

## 3. Mẫu tài khoản mặc định

| Email | Password | Role |
| --- | --- | --- |
| `admin@elearning.com` | `Admin123456` | ADMIN |
| `teacher@elearning.com` | `Teacher123456` | TEACHER |
| `student@elearning.com` | `Student123456` | STUDENT |
