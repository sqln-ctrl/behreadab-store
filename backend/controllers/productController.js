import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js";

// @GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, featured } = req.query;

  const query = { isActive: true };

  if (category && category !== "All") query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };
  if (minPrice || maxPrice) query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);
  if (featured === "true") query.isFeatured = true;

  const sortMap = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// @POST /api/products  [admin]
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, badge, stock, isFeatured } = req.body;

  const images = req.files?.map((f) => f.path) || [];
  const imagePublicIds = req.files?.map((f) => f.filename) || [];

  const product = await Product.create({
    name, description, price, category, badge, stock, isFeatured,
    image: images[0] || "",
    images,
    imagePublicIds,
  });
  res.status(201).json(product);
});

// @PUT /api/products/:id  [admin]
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const fields = ["name", "description", "price", "category", "badge", "stock", "isFeatured", "isActive"];
  fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

  // If new images uploaded, add to gallery
  if (req.files?.length) {
    const newImages = req.files.map((f) => f.path);
    const newIds = req.files.map((f) => f.filename);
    product.images = [...product.images, ...newImages];
    product.imagePublicIds = [...product.imagePublicIds, ...newIds];
    product.image = product.images[0];
  }

  const updated = await product.save();
  res.json(updated);
});

// @DELETE /api/products/:id  [admin]
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Delete images from Cloudinary
  for (const publicId of product.imagePublicIds) {
    await cloudinary.uploader.destroy(publicId);
  }

  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

// @POST /api/products/:id/reviews
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) return res.status(400).json({ message: "Already reviewed" });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.updateRating();
  await product.save();
  res.status(201).json({ message: "Review added" });
});
