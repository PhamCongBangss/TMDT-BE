const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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

exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Chưa chọn file avatar", 400));
  }

  const avatarFilename = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    avatar: avatarPath,
  }).select("-password");

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});
