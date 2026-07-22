import { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";

const BADGE_COLORS = {
  Bestseller:  { bg:"#000",    text:"#fff" },
  New:         { bg:"#000",    text:"#fff" },
  "Top Rated": { bg:"#000",    text:"#fff" },
  Limited:     { bg:"#000",    text:"#fff" },
  Sale:        { bg:"#ef4444", text:"#fff" },
};

const ProductCard = ({ id, image, name, price, originalPrice, rating, reviews, category, badge }) => {
  const [added, setAdded]                = useState(false);
  const { addToCart }                    = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(id);

  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ id, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist({ id, name, price, image });
  };

  return (
    <Link to={`/product/${id}`}>
      <motion.div className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 h-full flex flex-col"
        whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}>

        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{ paddingTop: "100%" }}>
          <motion.img src={image} alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} />

          {/* Badge */}
          {(badge || discount) && (
            <span className="absolute top-2.5 left-2.5 text-xs font-bold px-2.5 py-1 rounded-full z-10"
              style={{ background: discount ? "#ef4444" : (BADGE_COLORS[badge]?.bg ?? "#000"), color: discount ? "#fff" : (BADGE_COLORS[badge]?.text ?? "#fff") }}>
              {discount ? `-${discount}%` : badge}
            </span>
          )}

          {/* Wishlist */}
          <motion.button className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm z-10"
            onClick={handleWishlist} whileTap={{ scale: 0.85 }}>
            <FaHeart style={{ color: wishlisted ? "#ef4444" : "#d1d5db", fontSize: "12px" }} />
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-3 md:p-4 flex flex-col flex-1">
          {category && <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{category}</p>}
          <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1 line-clamp-2">{name}</h3>

          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="min-w-0">
              <p className="font-black text-black text-sm md:text-base leading-none">
                PKR {Number(price).toLocaleString()}
              </p>
              {originalPrice && originalPrice > price && (
                <p className="text-xs text-gray-400 line-through mt-0.5">
                  PKR {Number(originalPrice).toLocaleString()}
                </p>
              )}
            </div>

            <motion.button onClick={handleAddToCart}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-colors"
              style={{ background: added ? "#22c55e" : "#000" }}
              whileTap={{ scale: 0.9 }}>
              <FaShoppingCart style={{ fontSize: "10px" }} />
              <span className="hidden sm:inline">{added ? "✓" : "Add"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
