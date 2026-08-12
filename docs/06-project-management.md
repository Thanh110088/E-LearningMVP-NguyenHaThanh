# 06. Quản Lý Dự Án & DoD ETech (Project Management & DoD)

## 1. Tiêu chí hoàn thành (Definition of Done - DoD)
- [x] Tái cấu trúc giao diện thương hiệu **ETech** theo chuẩn 3 thiết kế.
- [x] Phát triển hoàn chỉnh **Chức năng nâng cấp gói cước (Free, Pro 99k, Enterprise)**.
- [x] Tạo màn hình **Bảng Giá & So Sánh Tính Năng (`/pricing`)**.
- [x] Xây dựng Modal nâng cấp gói `UpgradeModal` với phương thức chuyển khoản QR Banking / MoMo.
- [x] Chạy bộ test tích hợp backend đạt **11/11 tests PASS**.
- [x] Chạy build sản phẩm frontend ETech đạt thành công **0 errors**.
- [x] Cập nhật bộ tài liệu thiết kế và hướng dẫn sử dụng trong thư mục `docs/`.

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
