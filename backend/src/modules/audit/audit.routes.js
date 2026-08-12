const express = require("express");
const auditController = require("./audit.controller");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("ADMIN"), auditController.getLogs);

module.exports = router;
