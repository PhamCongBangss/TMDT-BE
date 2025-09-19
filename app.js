const express = require("express");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");
const globalErrorHandle = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const path = require("path");
const AppError = require("./utils/appError");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/users", userRouter);

app.use(
  "/img/avatars",
  express.static(path.join(__dirname, "public/img/avatars"))
);

app.use((req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

app.use(globalErrorHandle);

module.exports = app;
