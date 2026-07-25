# 06. Quản Lý Dự Án & Quyền Quản Trị (Project Management & DoD)

## 1. Tiêu chí hoàn thành (Definition of Done - DoD)
- [x] Thiết kế & Cấu hình Database PostgreSQL local thành công.
- [x] Hoàn thiện trọn vẹn 100% các API REST trong Backend.
- [x] Xây dựng đầy đủ các màn hình Frontend giao diện hiện đại (Dark Glassmorphism).
- [x] Chạy bộ test tích hợp backend đạt **11/11 tests PASS**.
- [x] Chạy build sản phẩm frontend thành công không phát sinh lỗi.
- [x] Cập nhật đầy đủ bộ tài liệu thiết kế và hướng dẫn sử dụng.

---

## 2. Quy trình kiểm thử & Đảm bảo chất lượng (QA)
- **Kiểm thử API Backend**:
  ```bash
  npm run test --workspace=backend
  ```
- **Kiểm thử Biên dịch Frontend**:
  ```bash
  npm run build --workspace=frontend
  ```
- **Khôi phục dữ liệu mẫu**:
  ```bash
  npm run seed --workspace=backend
  ```
