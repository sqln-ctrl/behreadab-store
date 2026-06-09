import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @GET /api/users  [admin]
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .sort("-createdAt")
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ users, total });
});

// @GET /api/users/:id  [admin]
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// @PUT /api/users/:id  [admin] — toggle active, change role
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.role) user.role = req.body.role;

  const updated = await user.save();
  res.json(updated.toJSON());
});

// @POST /api/users/address  — add/update address
export const saveAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = req.body;

  if (addr.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  if (addr._id) {
    // update existing
    const idx = user.addresses.findIndex((a) => a._id.toString() === addr._id);
    if (idx !== -1) user.addresses[idx] = { ...user.addresses[idx].toObject(), ...addr };
  } else {
    user.addresses.push(addr);
  }

  await user.save();
  res.json(user.addresses);
});

// @DELETE /api/users/address/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json(user.addresses);
});

// @GET/POST /api/users/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(productId);
  if (idx === -1) user.wishlist.push(productId);
  else user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ wishlisted: idx === -1 });
});
