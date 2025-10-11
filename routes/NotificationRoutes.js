const express = require("express");
const authController = require("../controllers/authController");
const notificationController = require("../controllers/notifcationController");

const router = express.Router();

router
  .route("/")
  .post(authController.protect, notificationController.createNotification)
  .get(authController.protect, notificationController.getNotifications);

router.put(
  "/read/:id",
  authController.protect,
  notificationController.markAsRead
);

module.exports = router;
