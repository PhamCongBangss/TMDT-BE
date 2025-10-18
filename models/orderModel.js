const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    total_amount: {
      type: Number,
      required: true,
    },
    final_amount: {
      type: Number,
      required: true,
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
    },
    shippingFee: { type: Number },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", OrderSchema);

module.exports = OrderModel;
