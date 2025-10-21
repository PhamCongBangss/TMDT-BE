const express = require("express");
const storeController = require("../controllers/StoreController");
const authController = require("../controllers/authController");
const uploadCitizen = require("../middlewares/uploadCitizen");

const router = express.Router();

router.post(
  "/",
  authController.protect,
  // authController.restrictTo("user"),
  uploadCitizen,
  storeController.createStore
);

router.get("/", authController.protect, storeController.getStores);

// Lấy danh sách cửa hàng pending
router.get(
  "/pending",
  authController.protect,
  storeController.getPendingStores
);

// Duyệt cửa hàng
router.patch(
  "/:id/approve",
  authController.protect,
  storeController.approveStore
);

// Từ chối cửa hàng
router.patch(
  "/:id/reject",
  authController.protect,

  storeController.rejectStore
);

module.exports = router;
