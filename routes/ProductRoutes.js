const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const uploadProduct = require("../middlewares/uploadProduct");
const router = express.Router();

router.post(
  "/",
  authController.protect,
  uploadProduct.any(),
  productController.createProduct
);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
