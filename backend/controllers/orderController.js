import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items?.length) return res.status(400).json({ message: "No items in order" });

  // Verify products exist and calculate totals from DB (never trust frontend prices)
  let itemsTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });
    if (product.stock < item.qty) return res.status(400).json({ message: `${product.name} is out of stock` });

    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: item.qty,
    });
    itemsTotal += product.price * item.qty;

    // Reduce stock
    product.stock -= item.qty;
    await product.save();
  }

  const shippingCost = itemsTotal >= 200 ? 0 : 15;
  const totalAmount = itemsTotal + shippingCost;

  const order = await Order.create({
    user: req.user._id,
    items: verifiedItems,
    shippingAddress,
    paymentMethod: paymentMethod || "cod",
    itemsTotal,
    shippingCost,
    totalAmount,
    notes,
  });

  res.status(201).json(order);
});

// @GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json(orders);
});

// @GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Only owner or admin can view
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ message: "Not authorized" });

  res.json(order);
});

// @PUT /api/orders/:id/pay
export const markAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = req.body;
  order.status = "Processing";
  const updated = await order.save();
  res.json(updated);
});

// ── Admin routes ──

// @GET /api/orders  [admin]
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort("-createdAt")
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @PUT /api/orders/:id/status  [admin]
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === "Delivered") order.deliveredAt = Date.now();

  const updated = await order.save();
  res.json(updated);
});
