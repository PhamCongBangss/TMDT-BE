const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadReviews = multer({ storage });

module.exports = uploadReviews;
