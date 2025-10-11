const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    province: String,
    district: String,
    ward: String,
    detail: String,

    name: { type: String, required: true },

    phone: { type: String, required: true },

    citizenCode: { type: String, required: true },

    citizenImageFront: { type: String, required: true },

    citizenImageBack: { type: String, required: true },

    status: {
      type: String,
      enum: ["Pending", "Approval", "Reject"],
      default: "Approval",
    },

    SKU_code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);

module.exports = Store;
