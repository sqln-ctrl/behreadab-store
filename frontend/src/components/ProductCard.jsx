import { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import Rating from "./Rating";

const BADGE_COLORS = {
  Bestseller: { bg: "#000",    text: "#fff" },
  New:        { bg: "#000",    text: "#fff" },
  "Top Rated":{ bg: "#000",    text: "#fff" },
  Limited:    { bg: "#000",    text: "#fff" },
  Sale:       { bg: "#ef4444", text: "#fff" },
};

const ProductCard = ({ id, image, name, price, rating, reviews, category, badge }) => {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(id);

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
      <motion.div
        className="bg-white rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 h-full"
        whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}>

        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "220px" }}>
          <motion.img src={image} alt={name} className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }} transition={{ duration: 0.5, ease: "easeOut" }} />

          {badge && (
            <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full z-10"
              style={{ background: BADGE_COLORS[badge]?.bg ?? "#000", color: BADGE_COLORS[badge]?.text ?? "#fff" }}>
              {badge}
            </span>
          )}

          <motion.button
            className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-lg z-10"
            onClick={handleWishlist} whileTap={{ scale: 0.85 }}
            animate={{ scale: wishlisted ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.3 }}>
            <FaHeart style={{ color: wishlisted ? "#ef4444" : "#9ca3af", fontSize: "14px" }} />
          </motion.button>

          <motion.div className="absolute inset-0 flex items-end justify-center pb-4"
            initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.2 }}
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }}>
            <span className="text-white text-xs uppercase tracking-[0.2em] font-semibold">View Details</span>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4">
          {category && <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{category}</p>}
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{name}</h3>
          {rating && <div className="mt-1.5"><Rating value={rating} count={reviews} /></div>}

          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-black text-black">PKR {Number(price).toLocaleString()}</span>

            <motion.button onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: added ? "#22c55e" : "#000" }}
              whileTap={{ scale: 0.93 }}
              whileHover={{ background: added ? "#22c55e" : "#333" }}
              animate={{ background: added ? "#22c55e" : "#000" }}
              transition={{ duration: 0.2 }}>
              <FaShoppingCart style={{ fontSize: "11px" }} />
              <span>{added ? "Added!" : "Add"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
