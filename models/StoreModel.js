const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    address: { type: String, required: true },

    name: { type: String, required: true },

    phone: { type: String, required: true },

    citizenCode: { type: String, required: true },

    citizenImageFront: { type: String, required: true },

    citizenImageBack: { type: String, required: true },

    status: {
      type: String,
      enum: ["Pending", "Approval", "Reject"],
      default: "Pending",
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

const StoreModel = mongoose.model("Store", storeSchema);

module.exports = StoreModel;
