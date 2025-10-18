const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size_value: {
    type: String,
    required: true,
  },
});

const SizeModel = mongoose.model("Size", sizeSchema);

module.exports = SizeModel;
