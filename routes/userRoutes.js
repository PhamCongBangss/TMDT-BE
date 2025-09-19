const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const uploadAvatar = require("../middlewares/uploadAvatar");

const router = express.Router();

router.get("/", authController.getAllUsers);

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/resend-otp-forgot-password",
  authController.resendOtpForgotPassword
);
router.post("/verify-forgot-password", authController.verifyForgotPassword);

router.post(
  "/reset-password",
  authController.verifyResetTokenCookie,
  authController.resetPassword
);

router
  .route("/me")
  .get(authController.protect, userController.getMe)
  .patch(
    authController.protect,
    uploadAvatar.single("avatar"),
    userController.updateMe
  );

module.exports = router;
