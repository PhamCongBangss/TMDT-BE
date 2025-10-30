const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    description: { type: String, required: true },
    totalRating: { type: Number, default: 0 },
    tradedCount: { type: Number, default: 0 },
    countRating: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Đang bán", "Ngừng bán"],
      default: "Đang bán",
    },
  },
  {
    timestamps: true,
  }
);

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
