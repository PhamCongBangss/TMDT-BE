const mongoose = require("mongoose");
const { applyPromotionsToItems } = require("../utils/calculateCart");

const cartItemSchema = new mongoose.Schema({
  cartStore_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CartStore",
    required: true,
  },
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariants",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unitPrice: {
    type: Number,
  },
  finalPrice: {
    type: Number,
  },
  is_chosen: {
    type: Boolean,
    default: false,
  },
  is_out_of_stock: {
    type: Boolean,
    default: false,
  },
  discountValue: { type: Number, default: 0 },
});

cartItemSchema.pre("save", async function (next) {
  if (
    !this.finalPrice ||
    this.isModified("quantity") ||
    this.isModified("unitPrice")
  ) {
    this.finalPrice = this.unitPrice * this.quantity;
  }
  next();
});

cartItemSchema.post("save", async function (doc) {
  try {
    const CartStore = mongoose.model("CartStore");
    const store = await CartStore.findById(doc.cartStore_id);

    if (store && store.onDeploy === false) {
      store.onDeploy = true;
      await store.save();
    }

    if (store && store.cart_id) {
      await applyPromotionsToItems(store.cart_id, store._id);
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật promotion:", err);
  }
});

cartItemSchema.pre("updateMany", async function (next) {
  const update = this.getUpdate();
  if (update.unitPrice != null || update.quantity != null) {
    update.finalPrice = update.unitPrice * update.quantity;
    this.setUpdate(update);
  }

  try {
    const CartItem = mongoose.model("CartItem");
    const items = await CartItem.find(this.getQuery());
    const CartStore = mongoose.model("CartStore");
    for (const item of items) {
      const store = await CartStore.findById(item.cartStore_id);
      if (store && store.cart_id) {
        await applyPromotionsToItems(store.cart_id, store._id);
      }
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật promotion:", err);
  }
  next();
});

cartItemSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    this._cartStore_id_temp = this.cartStore_id;
    this._id_temp = this._id;
    next();
  }
);

cartItemSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc) {
    try {
      const CartStore = mongoose.model("CartStore");
      const CartItem = mongoose.model("CartItem");
      const store = await CartStore.findById(doc._cartStore_id_temp);
      if (store && store.cart_id) {
        const remainingItems = await CartItem.countDocuments({
          cartStore_id: store._id,
        });
        if (remainingItems === 0) {
          console.log("Store will be set to onDeploy=false");
          store.onDeploy = false;
          store.subTotal = 0;
          store.finalTotal = 0;
          store.promotion = null;
          await store.save({ validateBeforeSave: false });
          await applyPromotionsToItems(store.cart_id);
        } else {
          console.log("Recalculating promotions...");
          await applyPromotionsToItems(store.cart_id, store._id);
        }
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật sau khi xóa item:", err);
    }
  }
);

const CartItemModel = mongoose.model("CartItem", cartItemSchema);
module.exports = CartItemModel;
