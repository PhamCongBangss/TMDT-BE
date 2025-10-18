const mongoose = require("mongoose");

const productTagsSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  tag_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
    required: true,
  },
});

const ProductTagsModel = mongoose.model("ProductTags", productTagsSchema);

module.exports = ProductTagsModel;
