const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("./auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken,
);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;
