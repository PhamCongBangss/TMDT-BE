// const express = require("express");
// const productController = require("../controllers/productController");
// const authController = require("../controllers/authController");
// const uploadProduct = require("../middlewares/uploadProduct");
// const router = express.Router();

// router.post(
//   "/",
//   authController.protect,
//   uploadProduct.any(),
//   productController.createProduct
// );

// router.get("/", productController.getAllProducts);
// router.get("/:id", productController.getProductById);

// module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllAdmin);

router.get("/most-favourite", productController.getMostFavourite);

router.get("/top-rating", productController.getTopRating);

router.get("/search", productController.searchByName);

router.get("/:id", productController.getOneProduct);

router.get("/get-by-store/:storeId", productController.getByStore);

router.patch("/change-product-status", productController.changeProductStatus);

module.exports = router;
