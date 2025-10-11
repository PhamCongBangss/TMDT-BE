const Product = require("../models/ProductModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Store = require("../models/StoreModel");

exports.createProduct = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const store = await Store.findOne({ user: userId });
  if (!store) {
    return next(
      new AppError("Bạn cần tạo cửa hàng trước khi thêm sản phẩm", 400)
    );
  }

  const { name, description, category, price, discountPercent, SKU, variants } =
    req.body;

  // 🖼️ Lấy đường dẫn ảnh từ Multer (Cloudinary hoặc local)
  const imageUrls = req.files?.map((file) => file.path);

  // Parse JSON nếu cần
  let parsedVariants =
    typeof variants === "string" ? JSON.parse(variants) : variants;

  // 🟢 Gán ảnh tương ứng cho từng biến thể
  if (Array.isArray(parsedVariants) && imageUrls?.length) {
    parsedVariants.forEach((variant, i) => {
      // Gán từng ảnh cho từng biến thể
      variant.image = imageUrls[i] || "";
    });
  }

  // 🧮 Tính tổng stock
  let totalStock = 0;
  parsedVariants?.forEach((variant) => {
    variant.sizes?.forEach((size) => {
      totalStock += Number(size.stock) || 0;
    });
  });

  // 🆕 Tạo sản phẩm mới
  const newProduct = await Product.create({
    store: store._id,
    name,
    description,
    category,
    price,
    discountPercent,
    SKU,
    variants: parsedVariants,
    totalStock,
  });

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find().populate("store", "name user");
  // populate store chỉ lấy name và user

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

// 🔹 Lấy sản phẩm theo ID
exports.getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate("store", "name user");

  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm với ID này", 404));
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});
