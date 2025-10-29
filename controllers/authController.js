const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/mail");
const crypto = require("crypto");
const TempUser = require("../models/TempUserModel");
const { signToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createSendToken = (user, message, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
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
        role: user.role,
      },
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return next(new AppError("Username hoặc Email đã tồn tại", 400));
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  console.log(otp);

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

  console.log(user);

  await TempUser.deleteOne({ _id: tempUser._id });

  createSendToken(user, "Đăng ký tài khoản thành công", 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Vui lòng nhập email và mật khẩu", 400));
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng", 401));
  }

  createSendToken(user, "Đăng nhập thành công", 200, res);
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) {
    return next(
      new AppError("Không tìm thấy yêu cầu đăng ký với email này", 404)
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  tempUser.otp = otp;
  tempUser.otpExpires = Date.now() + 5 * 60 * 1000;
  await tempUser.save({ validateBeforeSave: false });

  await sendEmail({
    email,
    subject: "Mã OTP xác thực mới",
    message: `Mã OTP mới của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
  });

  res.status(200).json({
    status: "success",
    message: "OTP mới đã được gửi đến email của bạn.",
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let { search, role, isActive, page = 1, limit = 5 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = {};

  // 🔍 Tìm theo tên hoặc email
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // 🎭 Lọc theo vai trò
  if (role) filter.role = role;

  // ⚙️ Lọc theo trạng thái hoạt động
  if (isActive === "true") filter.isActive = true;
  if (isActive === "false") filter.isActive = false;

  // 🧮 Tổng số user (trước phân trang)
  const totalUsers = await User.countDocuments(filter);

  // ⚡ Truy vấn có phân trang
  const users = await User.find(filter).sort({ createdAt: -1 }); // mới nhất trước
  // .skip((page - 1) * limit)
  // .limit(limit);

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit,
    },
    data: {
      users,
    },
  });
});

exports.resendOtpForgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Không tìm thấy người dùng", 404));
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  user.otpReset = {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attemptCount: 0,
  };

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email,
    subject: "Mã OTP xác thực mới",
    message: `Mã OTP mới của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
  });

  res.status(200).json({
    status: "success",
    message: "OTP mới đã được gửi đến email của bạn.",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email không tồn tại", 404));
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  user.otpReset = {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attemptCount: 0,
  };

  await user.save();

  await sendEmail({
    email,
    subject: "Mã OTP khôi phục mật khẩu",
    message: `Mã OTP mới của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
  });

  res.status(200).json({ message: "OTP đã gửi tới email của bạn" });
});

exports.verifyForgotPassword = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.otpReset) {
    return next(new AppError("User không tồn tại hoặc chưa yêu cầu OTP", 404));
  }

  if (user.otpReset.expiresAt < Date.now()) {
    return next(new AppError("OTP đã hết hạn", 400));
  }

  if (user.otpReset.code !== otp) {
    return next(new AppError("OTP không đúng", 400));
  }

  const resetToken = signToken(user.email);

  res.cookie("resetToken", resetToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 10 * 60 * 1000,
  });

  res.status(200).json({ message: "OTP hợp lệ, cho phép reset mật khẩu" });
});

exports.verifyResetTokenCookie = catchAsync(async (req, res, next) => {
  const token = req.cookies.resetToken;

  if (!token) return next(new AppError("Không có quyền đổi mật khẩu", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.email = decoded.id;

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;
  const { email } = req;

  const user = await User.findOne({ email });

  if (!user) return next(new AppError("Người dùng không tồn tại", 404));

  user.password = newPassword;
  await user.save();

  res.clearCookie("resetToken");

  res.json({ message: "Đổi mật khẩu thành công" });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  res.status(200).json({
    status: "success",
    message: "Đăng xuất thành công",
  });
});

exports.confirmChangePassword = catchAsync(async (req, res, next) => {
  const { currentPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("Người dùng không tồn tại", 404));
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError("Mật khẩu hiện tại không đúng", 401));
  }

  res.status(200).json({
    status: "success",
    valid: true,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("Người dùng không tồn tại", 404));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Đổi mật khẩu thành công",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Bạn chưa đăng nhập, vui lòng đăng nhập lại", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("Người dùng không tồn tại", 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Bạn không có quyền truy cập tài nguyên này", 403)
      );
    }
    next();
  };
};
