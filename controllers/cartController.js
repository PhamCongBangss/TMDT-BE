const Cart = require("../models/CartModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.addToCart = catchAsync(async (req, res, next) => {
  const { product, color, size, quantity, price, image } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });

  const itemData = { product, color, size, quantity, price, image };

  if (cart) {
    const existingIndex = cart.items.findIndex(
      (i) => i.product.equals(product) && i.color === color && i.size === size
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push(itemData);
    }

    await cart.save();
  } else {
    cart = await Cart.create({
      user: userId,
      items: [itemData],
    });
  }

  res.status(200).json({ status: "success", data: cart });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "store",
      select: "name address",
    },
  });
  res.status(200).json({ status: "success", data: cart });
});

// Xóa sản phẩm khỏi giỏ
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();

  res.status(200).json({ status: "success", data: cart });
});

exports.updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError("Số lượng phải >= 1", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError("Không tìm thấy giỏ hàng", 404));

  const item = cart.items.id(itemId);
  if (!item)
    return next(new AppError("Không tìm thấy sản phẩm trong giỏ hàng", 404));

  item.quantity = quantity;

  await cart.save();

  const populatedCart = await cart.populate({
    path: "items.product",
    select: "name price store",
    populate: { path: "store", select: "name address" },
  });

  res.status(200).json({ status: "success", data: populatedCart });
});

exports.removeCartItem = catchAsync(async (req, res, next) => {
  const { cartId, itemId } = req.params;

  const cart = await Cart.findById(cartId);
  if (!cart) return next(new AppError("Không tìm thấy giỏ hàng", 404));

  const item = cart.items.id(itemId);
  if (!item)
    return next(new AppError("Không tìm thấy sản phẩm trong giỏ hàng", 404));

  item.remove();
  await cart.save();

  const populatedCart = await cart.populate({
    path: "items.product",
    select: "name price store",
    populate: { path: "store", select: "name address" },
  });

  res.status(200).json({ status: "success", data: populatedCart });
});

exports.toggleSelect = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { itemIds, selected } = req.body;

  // itemIds có thể là 1 hoặc mảng
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return next(new AppError("Không tìm thấy giỏ hàng", 404));

  // Lặp qua từng item để cập nhật trạng thái selected
  cart.items.forEach((item) => {
    if (ids.includes(item._id.toString())) {
      item.selected = selected;
    }
  });

  await cart.save();

  const populatedCart = await cart.populate({
    path: "items.product",
    select: "name price store",
    populate: { path: "store", select: "name address" },
  });

  res.status(200).json({
    status: "success",
    data: populatedCart,
  });
});
