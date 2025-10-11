const express = require("express");
const cartController = require("../controllers/cartController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(cartController.getCart) // Lấy giỏ hàng của user
  .post(cartController.addToCart); // Thêm sản phẩm vào giỏ hàng

// Xóa 1 item khỏi giỏ hàng
router
  .route("/:itemId")
  .delete(cartController.removeFromCart)
  .patch(cartController.updateCartItemQuantity); // Xóa sản phẩm theo itemId

router.patch("/toggle-select", cartController.toggleSelect);
module.exports = router;
