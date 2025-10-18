const express = require("express");
const authController = require("../controllers/authController");
const OrderController = require("../controllers/orderController");

const route = express.Router();

route.post("/", authController.protect, OrderController.createOrder);
// route.post("/cancel", authController.protect, OrderController.cancelOrder);
route.get("/", OrderController.getOrders);

module.exports = route;
