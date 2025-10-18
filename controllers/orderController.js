const Order = require("../models/OrderModel");
const OrderStore = require("../models/OrderStoreModel");
const Address = require("../models/AddressModel");

const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const {
    name,
    phone,
    address,
    items,
    shippingFee,
    totalPrice,
    paymentMethod,
    note,
  } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError("Không có sản phẩm để tạo đơn hàng", 400));
  }

  // 1. Tạo order
  const order = await Order.create({
    user: userId,
    name,
    phone,
    address,
    items,
    shippingFee,
    totalPrice,
    paymentMethod,
    note,
  });

  // 2. Update product sold và stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    // Tăng sold
    product.sold = (product.sold || 0) + item.quantity;

    // Giảm stock theo size & color nếu có variants
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      );
      if (variant) {
        variant.stock -= item.quantity;
        if (variant.stock < 0) variant.stock = 0;
      }
    }

    await product.save();
  }

  // 3. Xóa sản phẩm khỏi cart
  // Lấy cart của user
  const cart = await Cart.findOne({ user: userId });

  console.log(cart.items);
  console.log("////////////////////////////////");
  console.log(order.items);

  if (cart) {
    cart.items = cart.items.filter(
      (ci) => !items.some((i) => i.productId === ci.productId)
    );

    await cart.save();
  }

  res.status(201).json({
    status: "success",
    order,
  });
});

exports.getOrders = async (req, res) => {
  // const user = req.user;
  // const addressIds = await Address.distinct("_id", { user: user._id });
  const order = await Order.aggregate([
    // {
    //   $match: { contact: { $in: addressIds } },
    // },

    // === Lấy thông tin địa chỉ ===
    {
      $lookup: {
        from: "addresses",
        localField: "contact",
        foreignField: "_id",
        as: "contact",
      },
    },
    { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },

    // === Lookup các orderStore thuộc order này ===
    {
      $lookup: {
        from: "orderstores",
        let: { oid: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$order_id", "$$oid"] } } },

          // 🔹 Lookup store (vì store nằm ở orderStore)
          {
            $lookup: {
              from: "stores",
              let: { sid: "$store" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$sid"] } } },

                // lookup chủ store
                {
                  $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                {
                  $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                  },
                },

                // chỉ lấy trường cần
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    user: {
                      _id: "$user._id",
                      avatar: "$user.avatar",
                    },
                  },
                },
              ],
              as: "store",
            },
          },
          { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },

          // 🔹 Lookup orderItem thuộc orderStore
          {
            $lookup: {
              from: "orderitems",
              let: { osid: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$storeOrder", "$$osid"] } } },

                // === lookup variant ===
                {
                  $lookup: {
                    from: "productvariants",
                    let: { vid: "$variant_id" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$vid"] } } },

                      // Lấy product (chỉ tên)
                      {
                        $lookup: {
                          from: "products",
                          localField: "product_id",
                          foreignField: "_id",
                          as: "product_id",
                        },
                      },
                      {
                        $unwind: {
                          path: "$product_id",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          size: 1,
                          price: 1,
                          product_id: { name: "$product_id.name" },
                          image: 1,
                        },
                      },

                      // Lấy image (chỉ url, color)
                      {
                        $lookup: {
                          from: "images",
                          localField: "image",
                          foreignField: "_id",
                          as: "image",
                        },
                      },
                      {
                        $unwind: {
                          path: "$image",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $project: {
                          product_id: 1,
                          size: 1,
                          price: 1,
                          image: {
                            url: "$image.url",
                            color: "$image.color",
                          },
                        },
                      },

                      // Lấy size (toàn bộ)
                      {
                        $lookup: {
                          from: "sizes",
                          localField: "size",
                          foreignField: "_id",
                          as: "size",
                        },
                      },
                      {
                        $unwind: {
                          path: "$size",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                    as: "variant_id",
                  },
                },
                {
                  $unwind: {
                    path: "$variant_id",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: "orderItem",
            },
          },
        ],
        as: "orderStore",
      },
    },
  ]);

  res.status(200).send({ message: "Success", data: order });
};

exports.getOrder = catchAsync(async (req, res, next) => {
  const orders = await Order.find();
  const orderStores = await OrderStore.find()
    .populate("store")
    .populate("order_id");
  res.status(200).json({
    data1: orders,
    data2: orderStores,
  });
});
