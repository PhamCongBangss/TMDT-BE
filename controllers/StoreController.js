const Store = require("../models/storeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createStore = catchAsync(async (req, res, next) => {
  const existingStore = await Store.findOne({ user: req.user._id });
  if (existingStore) {
    return next(new AppError("Bạn chỉ được đăng ký cửa hàng 1 lần", 400));
  }

  const store = await Store.create({
    user: req.user._id,
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    citizenCode: req.body.citizenCode,
    citizenImageFront: req.files?.citizenImageFront?.[0]?.path,
    citizenImageBack: req.files?.citizenImageBack?.[0]?.path,
    SKU_code: req.body.SKU_code,
  });

  res.status(201).json({
    status: "success",
    data: store,
  });
});
