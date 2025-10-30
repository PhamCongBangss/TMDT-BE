const express = require("express");
const uploadReviews = require("../middlewares/uploadReviews");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.route("/:productId").get(reviewController.getReviewsByProduct);

router
  .route("/")
  .post(
    authController.protect,
    uploadReviews.array("images", 5),
    reviewController.createReview
  );

module.exports = router;
