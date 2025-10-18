const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  color: {
    type: String,
    required: true,
  },
});

const ImageModel = mongoose.model("Image", imageSchema);

module.exports = ImageModel;
