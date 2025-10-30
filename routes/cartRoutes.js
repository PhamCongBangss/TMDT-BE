const express = require("express");
const authController = require("../controllers/authController");
const CartController = require("../controllers/cartController");

const router = express.Router();

router.get("/", authController.protect, CartController.getCart);
router.post("/addToCart", authController.protect, CartController.addToCart);
router.post("/buyNow", authController.protect, CartController.buyNow);
router.post("/reduce", authController.protect, CartController.reduceFromCart);
router.post(
  "/increase",
  authController.protect,
  CartController.increaseFromCart
);
router.post("/remove", authController.protect, CartController.removeFromCart);
router.post(
  "/change",
  authController.protect,
  CartController.changeCartItemState
);
router.get("/count", authController.protect, CartController.numberOfItem);
router.get("/preOrder", authController.protect, CartController.getPreOrderCart);
router.post(
  "/shippingFee",
  authController.protect,
  CartController.checkShippingFee
);
router.post(
  "/add-promotion",
  authController.protect,
  CartController.addPromotion
);

module.exports = router;
