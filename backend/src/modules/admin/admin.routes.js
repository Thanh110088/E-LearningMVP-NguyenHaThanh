const express = require("express");
const adminController = require("./admin.controller");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");
const validBodyRequest = require("../../middlewares/validBodyRequest");
const {
  updateUserRoleSchema,
  updateTeacherPlanSchema,
} = require("./admin.schema");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getUsers);
router.put("/users/:id/role", validBodyRequest(updateUserRoleSchema), adminController.updateUserRole);
router.put("/users/:id/toggle-status", adminController.toggleUserStatus);
router.get("/teachers", adminController.getTeachers);
router.put("/teachers/:id/plan", validBodyRequest(updateTeacherPlanSchema), adminController.updateTeacherPlan);
router.get("/revenue", adminController.getRevenueStats);

module.exports = router;
