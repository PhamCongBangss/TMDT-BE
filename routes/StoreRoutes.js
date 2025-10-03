const express = require("express");
const storeController = require("../controllers/StoreController");
const authController = require("../controllers/authController");
const uploadCitizen = require("../middlewares/uploadCitizen");

const router = express.Router();

router.post(
  "/",
  authController.protect,
  authController.restrictTo("user"),
  uploadCitizen,
  storeController.createStore
);

module.exports = router;
