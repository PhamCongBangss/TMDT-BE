const Store = require("../models/StoreModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createStore = catchAsync(async (req, res, next) => {
  const existingStore = await Store.findOne({ user: req.user._id });
  if (existingStore) {
    return next(new AppError("Bạn chỉ được đăng ký cửa hàng 1 lần", 400));
  }

  const address = `${req.body.detail}, ${req.body.ward}, ${req.body.district}, ${req.body.province}`;

  const store = await Store.create({
    user: req.user._id,
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    citizenCode: req.body.citizenCode,
    citizenImageFront: req.files?.citizenImageFront?.[0]?.path,
    citizenImageBack: req.files?.citizenImageBack?.[0]?.path,
    address,
  });

  res.status(201).json({
    status: "success",
    data: store,
  });
});

exports.getStores = catchAsync(async (req, res, next) => {
  const stores = await Store.find().populate("user").sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: stores.length,
    data: stores,
  });
});

exports.getPendingStores = catchAsync(async (req, res, next) => {
  const pendingStores = await Store.find({ status: "pending" })
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: pendingStores.length,
    data: pendingStores,
  });
});

exports.approveStore = catchAsync(async (req, res, next) => {
  const store = await Store.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );

  if (!store) return next(new AppError("Store not found", 404));

  const userId = store.user?._id || store.user;
  if (userId) {
    await User.findByIdAndUpdate(userId, { role: "seller" });
  } else {
    console.warn("⚠️ Store does not have a user field!");
  }

  res.status(200).json({ status: "success", data: store });
});

exports.rejectStore = catchAsync(async (req, res, next) => {
  const store = await Store.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );
  if (!store) return next(new AppError("Store not found", 404));

  res.status(200).json({ status: "success", data: store });
});
