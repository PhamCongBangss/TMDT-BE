const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/", authController.protect, orderController.createOrder);

// Nếu cần thêm các route khác, ví dụ lấy đơn hàng của user
// router.get("/me", protect, orderController.getMyOrders);

module.exports = router;
