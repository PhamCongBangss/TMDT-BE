const Notification = require("../models/NotificationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createNotification = catchAsync(async (req, res, next) => {
  const { title, message, type } = req.body;

  if (!title || !message) {
    return next(new AppError("Thiếu thông tin bắt buộc để tạo thông báo", 400));
  }

  const notification = await Notification.create({
    user: req.user.id,
    title,
    message,
    type: type || "info",
  });

  res.status(201).json({
    status: "success",
    data: notification,
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: notifications,
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;

  const notification = await Notification.findOne({
    _id: notificationId,
    user: req.user.id,
  });

  if (!notification) {
    return next(
      new AppError("Thông báo không tồn tại hoặc không thuộc về bạn", 404)
    );
  }

  // Đánh dấu đã đọc
  notification.read = true;
  await notification.save();

  res.status(200).json({
    status: "success",
    data: notification,
  });
});
