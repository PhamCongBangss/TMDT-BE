const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Review must be a rating"],
    },

    images: [
      {
        type: String,
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    // product: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "Product",
    //   required,
    // },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username avatar",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
