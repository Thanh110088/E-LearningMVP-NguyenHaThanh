# 03. Lộ Trình Sprints (Roadmap & Sprints)

## Bảng theo dõi tiến độ tổng quan

| Sprint | Phạm vi công việc | Trạng thái |
| :--- | :--- | :---: |
| **Sprint 1** | Nền tảng hệ thống, Auth JWT, Danh mục Môn học/Khối lớp & Catalog khám phá đề thi | ✅ 100% Hoàn thành |
| **Sprint 2** | Ngân hàng câu hỏi, Quản lý đề thi & Engine thi trực tuyến chấm điểm tự động | ✅ 100% Hoàn thành |
| **Sprint 3** | Live Room (nhập mã PIN), Analytics Dashboard & Bảng Xếp Hạng (Leaderboard) | ✅ 100% Hoàn thành |
| **Sprint 4** | Trích xuất báo cáo CSV, Nhật ký Audit Log, Integration Testing & Production Build | ✅ 100% Hoàn thành |

---

## Chi tiết kế hoạch bàn giao (Definition of Done - DoD)
- **Mã nguồn Backend & Frontend**: Viết mã nguồn sạch, đúng nguyên tắc layered architecture (Controller -> Service -> Repository).
- **Cơ sở dữ liệu**: Đồng bộ Prisma Schema với ứng dụng PostgreSQL local (`DATABASE_URL`) và seed đầy đủ dữ liệu mẫu.
- **Kiểm thử**: Đạt 100% PASS bộ test Jest Integration Backend (`npm run test`) và biên dịch thành công Frontend (`npm run build`).
