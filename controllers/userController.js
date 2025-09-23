const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Address = require("../models/AddressModel");

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const allowedFields = ["fullname", "phone"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field]) updateData[field] = req.body[field];
  });

  if (req.file) {
    updateData.avatar = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

exports.getAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: addresses.length,
    data: addresses,
  });
});

exports.addAddress = catchAsync(async (req, res, next) => {
  const { name, phone, province, district, ward, detail } = req.body;
  const count = await Address.countDocuments({ user: req.user.id });
  const address = await Address.create({
    user: req.user.id,
    name,
    phone,
    province,
    district,
    ward,
    detail,
    isDefault: count === 0,
  });

  res.status(201).json({
    status: "success",
    data: {
      address,
    },
  });
});

exports.setAddressDefault = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const address = await Address.findOne({ _id: id, user: req.user.id });

  if (!address) {
    return next(new AppError("Không tìm thấy địa chỉ này", 404));
  }

  await Address.updateMany(
    { user: req.user.id, _id: { $ne: id } },
    { $set: { isDefault: false } }
  );

  address.isDefault = true;
  await address.save();

  res.status(200).json({
    status: "success",
    data: { address },
  });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!address) {
    return next(new AppError("Không tìm thấy địa chỉ này", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, phone, province, district, ward, detail } = req.body;

  const address = await Address.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { name, phone, province, district, ward, detail },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!address) {
    return next(new AppError("Không tìm thấy địa chỉ này", 404));
  }

  res.status(200).json({
    status: "success",
    data: { address },
  });
});
