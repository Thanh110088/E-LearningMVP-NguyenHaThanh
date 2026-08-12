const express = require("express");
const adminController = require("./admin.controller");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

// Middleware: Tất cả các route dưới đây đều yêu cầu người dùng phải đăng nhập và có quyền ADMIN
router.use(authenticate, authorize("ADMIN"));

// TODO: Gắn các hàm xử lý từ adminController vào các route tương ứng
router.get("/stats" /* code của bạn ở đây */);
router.get("/users" /* code của bạn ở đây */);
router.put("/users/:id/role" /* code của bạn ở đây */);
router.put("/users/:id/toggle-status" /* code của bạn ở đây */);
router.get("/teachers" /* code của bạn ở đây */);
router.put("/teachers/:id/plan" /* code của bạn ở đây */);
router.get("/revenue" /* code của bạn ở đây */);

module.exports = router;
