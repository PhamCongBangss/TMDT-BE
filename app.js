const express = require("express");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const storeRouter = require("./routes/StoreRoutes");
const productRouter = require("./routes/ProductRoutes");
const cartRouter = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");
const notificationRouter = require("./routes/NotificationRoutes");
const cors = require("cors");
const globalErrorHandle = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const path = require("path");
const AppError = require("./utils/appError");
const upload = require("./middlewares/upload");
const authController = require("./controllers/authController");
const productController = require("./controllers/productController");
const tagController = require("./controllers/tagController");

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
app.use("/api/reviews", reviewRouter);
app.use("/api/products", productRouter);
app.use("/api/stores", storeRouter);
app.use("/api/carts", cartRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/orders", orderRouter);
app.use(
  "/api/createProduct",
  authController.protect,
  upload.array("variantImages"),
  productController.createNewProduct
);

app.get("/api/alltags", tagController.getAll);

app.get("/api/geocode", async (req, res) => {
  try {
    const address = (req.query.address || "").trim();
    if (!address)
      return res.status(400).json({ message: "address is required" });
    if (!process.env.DISTANCEMATRIX_API_KEY) {
      return res
        .status(500)
        .json({ message: "Missing DISTANCEMATRIX_API_KEY in .env" });
    }
    const url = `https://api.distancematrix.ai/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.DISTANCEMATRIX_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();

    const results = data.results || data.result;
    if (data.status !== "OK" || !results?.length) {
      return res
        .status(404)
        .json({ message: "Coordinates not found", raw: data });
    }
    const loc = results[0].geometry.location;
    return res.json({ lat: loc.lat, lng: loc.lng });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Geocoding error" });
  }
});

app.use(
  "/img/avatars",
  express.static(path.join(__dirname, "public/img/avatars"))
);

app.use((req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

app.use(globalErrorHandle);

module.exports = app;
