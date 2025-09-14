const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/mail");
const crypto = require("crypto");
const TempUser = require("../models/TempUserModel");
const { signToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");

const createSendToken = (user, message, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    status: "success",
    message,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  console.log(passwordConfirm);
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return next(new AppError("Username hoặc Email đã tồn tại", 400));
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  await TempUser.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpires: Date.now() + 5 * 60 * 1000,
  });

  await sendEmail({
    email,
    subject: "Mã OTP xác thực",
    message: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
  });

  res.status(201).json({
    status: "success",
    message: "Vui lòng kiểm tra email để xác thực OTP.",
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const tempUser = await TempUser.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  }).select("+password");

  if (!tempUser)
    return next(new AppError("OTP không hợp lệ hoặc đã hết hạn", 400));

  const user = await User.create({
    username: tempUser.username,
    email: tempUser.email,
    password: tempUser.password,
  });

  await TempUser.deleteOne({ _id: tempUser._id });

  createSendToken(user, "Đăng ký tài khoản thành công", 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Vui lòng nhập email và mật khẩu", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Email hoặc mật khẩu không đúng", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new AppError("Email hoặc mật khẩu không đúngs", 401));
  }

  createSendToken(user, "Đăng nhập thành công", 200, res);
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});
