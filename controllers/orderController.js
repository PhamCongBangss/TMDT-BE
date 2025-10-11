const Order = require("../models/orderModel");
const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const {
    name,
    phone,
    address,
    items,
    shippingFee,
    totalPrice,
    paymentMethod,
    note,
  } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError("Không có sản phẩm để tạo đơn hàng", 400));
  }

  // 1. Tạo order
  const order = await Order.create({
    user: userId,
    name,
    phone,
    address,
    items,
    shippingFee,
    totalPrice,
    paymentMethod,
    note,
  });

  // 2. Update product sold và stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    // Tăng sold
    product.sold = (product.sold || 0) + item.quantity;

    // Giảm stock theo size & color nếu có variants
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      );
      if (variant) {
        variant.stock -= item.quantity;
        if (variant.stock < 0) variant.stock = 0;
      }
    }

    await product.save();
  }

  // 3. Xóa sản phẩm khỏi cart
  // Lấy cart của user
  const cart = await Cart.findOne({ user: userId });

  console.log(cart.items);
  console.log("////////////////////////////////");
  console.log(order.items);

  if (cart) {
    cart.items = cart.items.filter(
      (ci) => !items.some((i) => i.productId === ci.productId)
    );

    await cart.save();
  }

  res.status(201).json({
    status: "success",
    order,
  });
});
