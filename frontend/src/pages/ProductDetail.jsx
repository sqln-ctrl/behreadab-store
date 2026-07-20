import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaShieldAlt, FaTruck, FaUndo, FaPlay } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import useSettings from "../hooks/useSettings";
import Rating from "../components/Rating";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { productsAPI } from "../services/api";

const ProductDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart }                    = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { settings }                     = useSettings();

  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [added,       setAdded]       = useState(false);

  useEffect(() => {
    setLoading(true); setActiveIndex(0);
    productsAPI.getById(id)
      .then(({ data }) => {
        setProduct(data);
        return productsAPI.getAll({ category: data.category, limit: 5 });
      })
      .then(({ data }) => setRelated((data.products || []).filter(p => p.id !== id).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-6xl">⌚</p><h2 className="text-2xl font-bold">Watch not found</h2><button onClick={() => navigate("/shop")} className="text-sm underline text-gray-500">Back to shop</button></div>;

  const wishlisted = isWishlisted(product.id);
  const stock      = product.inventory?.stock_qty ?? 999;
  const available  = stock - (product.inventory?.reserved_qty ?? 0);

  // All media (images + video if exists)
  const allMedia = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const activeMedia = allMedia[activeIndex];
  const isVideo = activeMedia && /\.(mp4|webm|mov)$/i.test(activeMedia);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  const warrantyMonths = product.warranty_months ?? settings.warranty_months;
  const returnDays     = product.return_days     ?? settings.return_days;
  const perks = [
    { icon: <FaTruck />,     label: `Free shipping over PKR ${Number(settings.free_delivery_threshold).toLocaleString()}` },
    { icon: <FaShieldAlt />, label: warrantyMonths >= 12 ? `${Math.round(warrantyMonths/12)}-year warranty` : `${warrantyMonths}-month warranty` },
    { icon: <FaUndo />,      label: `${returnDays}-day returns` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-4">
        <motion.button onClick={() => navigate(-1)} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition">
          <FaArrowLeft className="text-xs" /> Back
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start">
          {/* Media */}
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square">
              <AnimatePresence mode="wait">
                {isVideo ? (
                  <motion.video key={activeIndex} src={activeMedia} className="w-full h-full object-cover"
                    controls autoPlay muted initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }} />
                ) : (
                  <motion.img key={activeIndex} src={activeMedia} alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity:0, scale:1.03 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }} />
                )}
              </AnimatePresence>
            </div>
            {allMedia.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allMedia.map((media, i) => {
                  const isVid = /\.(mp4|webm|mov)$/i.test(media);
                  return (
                    <motion.button key={i} onClick={() => setActiveIndex(i)} whileTap={{ scale:0.95 }}
                      className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition relative"
                      style={{ borderColor: activeIndex === i ? "#000" : "transparent" }}>
                      {isVid ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <FaPlay className="text-white text-xs" />
                        </div>
                      ) : <img src={media} alt="" className="w-full h-full object-cover" />}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
            <p className="uppercase tracking-[0.3em] text-xs mb-2 text-black/40">{product.category}'s Collection</p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight text-black mb-3" style={{ fontFamily:"'Georgia', serif" }}>
              {product.name}
            </h1>
            {product.rating > 0 && <div className="mb-4"><Rating value={product.rating} count={product.num_reviews} size="lg" /></div>}

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-black text-black">PKR {Number(product.price).toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-gray-400 line-through">PKR {Number(product.original_price).toLocaleString()}</span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className={`text-sm font-semibold mb-5 ${available > 0 ? (available <= 5 ? "text-orange-500" : "text-green-600") : "text-red-500"}`}>
              {available > 0 ? (available <= 5 ? `Only ${available} left!` : "✓ In Stock") : "Out of Stock"}
            </p>

            <p className="text-gray-500 leading-relaxed text-sm mb-7">{product.description}</p>

            {available > 0 && (
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <motion.button onClick={() => setQuantity(q => Math.max(1,q-1))} whileTap={{ scale:0.9 }}
                    className="w-10 h-10 rounded-full border-2 font-bold text-lg flex items-center justify-center hover:border-black transition">−</motion.button>
                  <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                  <motion.button onClick={() => setQuantity(q => Math.min(available,q+1))} whileTap={{ scale:0.9 }}
                    className="w-10 h-10 rounded-full border-2 font-bold text-lg flex items-center justify-center hover:border-black transition">+</motion.button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <motion.button onClick={handleAddToCart} disabled={available === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wider disabled:opacity-50 transition"
                style={{ background: added ? "#22c55e" : "#000", color: "#fff" }}
                whileTap={{ scale:0.97 }}>
                <FaShoppingCart />
                {available === 0 ? "Out of Stock" : added ? "Added to Cart!" : "Add to Cart"}
              </motion.button>
              <motion.button onClick={() => toggleWishlist(product)} whileTap={{ scale:0.9 }}
                className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl flex-shrink-0 transition"
                style={{ borderColor: wishlisted ? "#ef4444" : "#e5e7eb", color: wishlisted ? "#ef4444" : "#9ca3af" }}>
                <FaHeart />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 border-t">
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
          <div className="mt-16">
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily:"'Georgia', serif" }}>You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}>
                  <ProductCard id={p.id} image={p.image} name={p.name} price={p.price} originalPrice={p.original_price} category={p.category} badge={p.badge} rating={p.rating} />
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
