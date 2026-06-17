import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaShieldAlt, FaTruck, FaUndo } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import Rating from "../components/Rating";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { productsAPI } from "../services/api";

const ProductDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart }                    = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [added,       setAdded]       = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    productsAPI.getById(id)
      .then(({ data }) => {
        setProduct(data);
        // Fetch related
        return productsAPI.getAll({ category: data.category, limit: 4 });
      })
      .then(({ data }) => {
        setRelated((data.products || []).filter((p) => p.id !== id).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-6xl">🕐</p>
      <h2 className="text-2xl font-bold">Watch not found</h2>
      <button onClick={() => navigate("/shop")} className="text-sm underline text-gray-500">Back to shop</button>
    </div>
  );

  const wishlisted = isWishlisted(product.id);
  const stock      = product.inventory?.stock_qty ?? 0;
  const available  = stock - (product.inventory?.reserved_qty ?? 0);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const perks = [
    { icon: <FaTruck />,     label: "Free shipping over PKR 5,000" },
    { icon: <FaShieldAlt />, label: "2-year warranty" },
    { icon: <FaUndo />,      label: "30-day returns" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-4">
        <motion.button onClick={() => navigate(-1)} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition">
          <FaArrowLeft className="text-xs" /> Back
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* Images */}
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-50" style={{ aspectRatio: "1/1" }}>
              <AnimatePresence mode="wait">
                <motion.img key={activeImage}
                  src={product.images?.[activeImage] ?? product.image} alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} />
              </AnimatePresence>
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <motion.button key={i} onClick={() => setActiveImage(i)} whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: activeImage === i ? "#000" : "transparent" }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <p className="uppercase tracking-[0.3em] text-xs mb-2 text-black/40">{product.category}'s Collection</p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight text-black" style={{ fontFamily: "'Georgia', serif" }}>
              {product.name}
            </h1>

            {product.rating > 0 && (
              <div className="mt-2"><Rating value={product.rating} count={product.num_reviews} size="lg" /></div>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-black text-black">
                PKR {Number(product.price).toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    PKR {Number(product.original_price).toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {available > 0 ? (
                <span className={`text-sm font-semibold ${available <= 5 ? "text-orange-500" : "text-green-600"}`}>
                  {available <= 5 ? `Only ${available} left!` : "✓ In Stock"}
                </span>
              ) : (
                <span className="text-sm font-semibold text-red-500">Out of Stock</span>
              )}
            </div>

            <p className="mt-4 text-gray-500 leading-relaxed text-sm md:text-base">{product.description}</p>

            {/* Quantity */}
            {available > 0 && (
              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-gray-600">Quantity</p>
                <div className="flex items-center gap-4">
                  <motion.button onClick={() => setQuantity((q) => Math.max(1, q - 1))} whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full border-2 font-bold text-lg flex items-center justify-center hover:border-black transition">−</motion.button>
                  <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                  <motion.button onClick={() => setQuantity((q) => Math.min(available, q + 1))} whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full border-2 font-bold text-lg flex items-center justify-center hover:border-black transition">+</motion.button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex gap-3">
              <motion.button onClick={handleAddToCart} disabled={available === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: added ? "#22c55e" : "#000", color: "#fff" }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ background: added ? "#22c55e" : "#222" }}>
                <FaShoppingCart />
                {available === 0 ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
              </motion.button>
              <motion.button onClick={() => toggleWishlist(product)} whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl transition-all flex-shrink-0"
                style={{ borderColor: wishlisted ? "#ef4444" : "#e5e7eb", color: wishlisted ? "#ef4444" : "#9ca3af" }}>
                <FaHeart />
              </motion.button>
            </div>

            {/* Perks */}
            <div className="mt-8 pt-6 border-t grid grid-cols-3 gap-3">
              {perks.map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-gray-400 text-lg">{icon}</span>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-black" style={{ fontFamily: "'Georgia', serif" }}>
              You may also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {related.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <ProductCard id={p.id} image={p.image} name={p.name} price={p.price}
                    originalPrice={p.original_price} rating={p.rating}
                    reviews={p.num_reviews} category={p.category} badge={p.badge} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
