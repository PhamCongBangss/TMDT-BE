const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "citizens",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadCitizen = multer({ storage }).fields([
  { name: "citizenImageFront", maxCount: 1 },
  { name: "citizenImageBack", maxCount: 1 },
]);

module.exports = uploadCitizen;
