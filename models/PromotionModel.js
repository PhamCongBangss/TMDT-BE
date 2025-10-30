const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    description: String,
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    name: { type: String, required: true },
    scope: { type: String, enum: ["store", "global"], required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: { type: Number, required: true },
    max_discount_value: { type: Number },
    quantity: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // quan trọng
    toObject: { virtuals: true }, // quan trọng
  }
);

// Hàm validate hạn promo
promotionSchema.pre("validate", function (next) {
  if (this.end_date < this.start_date) {
    return next(
      new Error("end_date must be greater than or equal to start_date")
    );
  }
  next();
});

// Validate lại phần value của promo
promotionSchema.pre("validate", function (next) {
  if (
    this.discount_type === "percentage" &&
    (this.discount_value <= 0 || this.discount_value > 100)
  ) {
    return next(
      new Error("percentage discount_value must be between 1 and 100")
    );
  }
  next();
});

// Trường ảo cho dashboard admin/store
promotionSchema.virtual("is_Active").get(function () {
  const now = new Date();
  return this.start_date <= now && now <= this.end_date && this.quantity > 0;
});

// Nếu promotion là fixed thì gán max_discount_value = discount_value
promotionSchema.pre("save", async function (next) {
  if (this.discount_type === "fixed") {
    this.max_discount_value = this.discount_value;
  }
  next();
});

const PromotionModel = mongoose.model("Promotion", promotionSchema);
module.exports = PromotionModel;
