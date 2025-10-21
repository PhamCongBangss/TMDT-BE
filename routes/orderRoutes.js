const express = require("express");
const authController = require("../controllers/authController");
const OrderController = require("../controllers/orderController");

const route = express.Router();

route.post("/", authController.protect, OrderController.createOrder);
// route.post("/cancel", authController.protect, OrderController.cancelOrder);
route.get("/", OrderController.getOrders);
// route.get("/:userId", OrderController.getOneOrders);
route.get("/:userId", OrderController.getOrder);

module.exports = route;
