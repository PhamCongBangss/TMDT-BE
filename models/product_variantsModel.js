const mongoose = require("mongoose");

const productVariantsSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    onDeploy: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper: cập nhật CartItem khi giá variant thay đổi
// async function updateCartItems(doc) {
//   if (doc) {
//     await mongoose.model("CartItem").updateMany({ variant_id: doc._id }, [
//       {
//         $set: {
//           unitPrice: doc.price,
//           finalPrice: { $multiply: ["$quantity", doc.price] },
//         },
//       },
//     ]);
//   }
// }

// Trigger sau khi update bằng findOneAndUpdate
// productVariantsSchema.post("findOneAndUpdate", async function (doc) {
//   await updateCartItems(doc);
// });

// Trigger sau khi save (create hoặc save thủ công)
// productVariantsSchema.post("save", async function (doc) {
//   await updateCartItems(doc);
// });

// Trigger trước khi save để kiểm tra tồn kho
// productVariantsSchema.pre("save", async function (next) {
//   if (this.quantity === 0) this.onDeploy = false;

//   const CartItem = mongoose.model("CartItem");

//   if (this.onDeploy === false) {
//     await CartItem.updateMany(
//       { variant_id: this._id },
//       {
//         $set: {
//           is_out_of_stock: true,
//           quantity: 0,
//           is_chosen: false,
//         },
//       }
//     );
//   }

//   next();
// });

const ProductVariantsModel = mongoose.model(
  "ProductVariants",
  productVariantsSchema
);

module.exports = ProductVariantsModel;
