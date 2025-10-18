// utils/cloudinary.js
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: "dm8ydkx0k",
  api_key: "789694356734282",
  api_secret: "3V3ihOhTQxGfmj3NWNF9OH_ef5Y",
});

// console.log("✅ Cloudinary config loaded:", cloudinary.config());

module.exports = cloudinary;
