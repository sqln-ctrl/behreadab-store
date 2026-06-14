import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();
await connectDB();

const products = [
  {
    name: "Rolex Submariner",
    description: "The Submariner is the reference among divers' watches. Robust and waterproof, it features a unidirectional rotating bezel for dive time monitoring.",
    price: 299, category: "Men", badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80", "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80"],
    stock: 15, rating: 4.8, numReviews: 124, isFeatured: true,
  },
  {
    name: "Omega Seamaster",
    description: "The Omega Seamaster is one of the world's most iconic watches. Combining functionality with elegance, water resistant with a beautiful blue wave dial.",
    price: 249, category: "Men", badge: "New",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80"],
    stock: 10, rating: 4.6, numReviews: 89, isFeatured: true,
  },
  {
    name: "Rose Gold Elegance",
    description: "Crafted with a delicate rose gold case and a mother-of-pearl dial, this watch embodies timeless femininity. Perfect for both formal and everyday wear.",
    price: 199, category: "Women", badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80"],
    stock: 20, rating: 4.9, numReviews: 201, isFeatured: true,
  },
  {
    name: "Luxury Diamond Watch",
    description: "A masterpiece of precision and luxury. Set with brilliant-cut diamonds on the bezel, the ultimate symbol of sophistication and refined taste.",
    price: 349, category: "Women", badge: "Limited",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80"],
    stock: 5, rating: 4.7, numReviews: 56, isFeatured: false,
  },
  {
    name: "TAG Heuer Carrera",
    description: "Born on the racing circuits of the 1960s. The TAG Heuer Carrera is a tribute to speed and precision with a clean dial and sporty design.",
    price: 319, category: "Men", badge: null,
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80"],
    stock: 8, rating: 4.5, numReviews: 73, isFeatured: false,
  },
  {
    name: "Pearl Bracelet Watch",
    description: "A graceful fusion of a pearl bracelet and a precision timepiece. Lightweight, feminine, and refined — the perfect gift for someone special.",
    price: 179, category: "Women", badge: "Sale",
    image: "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=600&q=80"],
    stock: 12, rating: 4.4, numReviews: 38, isFeatured: false,
  },
];

const seedDB = async () => {
  await Product.deleteMany();
  await User.deleteMany();

  await Product.insertMany(products);

  // Create admin user
  await User.create({
    name: "Admin",
    email: "admin@watchstore.com",
    password: "admin123",
    role: "admin",
  });

  console.log("✅ Database seeded!");
  console.log("📧 Admin: admin@watchstore.com | 🔑 Password: admin123");
  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
