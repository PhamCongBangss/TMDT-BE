const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: { type: String, required: true },
    name: { type: String, required: true },
    phone: String,
    status: {
      type: String,
      enum: ["pending", "approved", "reject"],
      default: "pending",
    },
    citizenCode: { type: String, required: true },
    citizenImageFront: { type: String, required: true },
    citizenImageBack: { type: String, required: true },

    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const StoreModel = mongoose.model("Store", storeSchema);

module.exports = StoreModel;
