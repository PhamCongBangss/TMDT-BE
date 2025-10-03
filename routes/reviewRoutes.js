const express = require("express");
const uploadReviews = require("../middlewares/uploadReviews");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router
  .route("/")
  .get(reviewController.getReviews)
  .post(
    authController.protect,
    uploadReviews.array("images", 5),
    reviewController.createReview
  );

module.exports = router;
