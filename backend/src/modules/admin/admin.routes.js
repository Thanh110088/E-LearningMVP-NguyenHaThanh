const express = require("express");
const adminController = require("./admin.controller");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

// Middleware: Tất cả các route dưới đây đều yêu cầu người dùng phải đăng nhập và có quyền ADMIN
router.use(authenticate, authorize("ADMIN"));

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/toggle-status", adminController.toggleUserStatus);
router.get("/teachers", adminController.getTeachers);
router.put("/teachers/:id/plan", adminController.updateTeacherPlan);
router.get("/revenue", adminController.getRevenueStats);

module.exports = router;
