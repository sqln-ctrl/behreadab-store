import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaShieldAlt, FaTruck, FaUndo, FaPlay, FaStar } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import useSettings from "../hooks/useSettings";
import Rating from "../components/Rating";
import ProductCard from "../components/ProductCard";
import ReviewForm from "../components/ReviewForm";
import Loader from "../components/Loader";
import { productsAPI } from "../services/api";
import useAuth from "../hooks/useAuth";

const ProductDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart }                    = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { settings }                     = useSettings();

  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [added,       setAdded]       = useState(false);
  const [reviewsKey,  setReviewsKey]  = useState(0); // force re-fetch reviews

  const fetchProduct = () => {
    setLoading(true); setActiveIndex(0);
    productsAPI.getById(id)
      .then(({ data }) => {
        setProduct(data);
        return productsAPI.getAll({ category: data.category, limit: 5 });
      })
      .then(({ data }) => setRelated((data.products||[]).filter(p=>p.id!==id).slice(0,4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProduct(); }, [id, reviewsKey]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-5">
      <p className="text-6xl">⌚</p>
      <h2 className="text-2xl font-bold">Watch not found</h2>
      <button onClick={()=>navigate("/shop")} className="text-sm underline text-gray-500">Back to shop</button>
    </div>
  );

  const wishlisted  = isWishlisted(product.id);
  const stock       = product.inventory?.stock_qty ?? 999;
  const reserved    = product.inventory?.reserved_qty ?? 0;
  const available   = Math.max(0, stock - reserved);

  // All media
  const allMedia  = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const activeMedia = allMedia[activeIndex] || "";
  const isVideo   = activeMedia && /\.(mp4|webm|mov)$/i.test(activeMedia);

  const handleAddToCart = () => {
    for (let i=0; i<quantity; i++) addToCart({ id:product.id, name:product.name, price:product.price, image:product.image });
    setAdded(true); setTimeout(()=>setAdded(false), 2000);
  };

  const warrantyMonths = product.warranty_months ?? settings.warranty_months ?? 24;
  const returnDays     = product.return_days     ?? settings.return_days     ?? 30;
  const freeThreshold  = settings.free_delivery_threshold ?? 5000;

  const perks = [
    { icon:<FaTruck />,     label:`Free shipping over PKR ${Number(freeThreshold).toLocaleString()}` },
    { icon:<FaShieldAlt />, label: warrantyMonths >= 12 ? `${Math.round(warrantyMonths/12)}-year warranty` : `${warrantyMonths}-month warranty` },
    { icon:<FaUndo />,      label:`${returnDays}-day returns` },
  ];

  const reviews   = product.reviews || [];
  const avgRating = reviews.length ? reviews.reduce((a,r)=>a+r.rating,0)/reviews.length : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-4">
        <motion.button onClick={()=>navigate(-1)} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition">
          <FaArrowLeft className="text-xs"/> Back
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start">

          {/* ── Media ── */}
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square">
              <AnimatePresence mode="wait">
                {isVideo ? (
                  <motion.video key={activeIndex} src={activeMedia} controls autoPlay muted
                    className="w-full h-full object-cover"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }} />
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
                    <motion.button key={i} onClick={()=>setActiveIndex(i)} whileTap={{ scale:0.95 }}
                      className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition relative"
                      style={{ borderColor: activeIndex===i ? "#000" : "transparent" }}>
                      {isVid
                        ? <div className="w-full h-full bg-gray-800 flex items-center justify-center"><FaPlay className="text-white text-xs"/></div>
                        : <img src={media} alt="" className="w-full h-full object-cover"/>}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
            <p className="uppercase tracking-[0.3em] text-xs mb-2 text-black/40">{product.category}'s Collection</p>

            <h1 className="text-3xl md:text-4xl font-black leading-tight text-black mb-3" style={{ fontFamily:"'Georgia', serif" }}>
              {product.name}
            </h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Rating value={avgRating} size="lg" />
                <span className="text-sm text-gray-400">({reviews.length} review{reviews.length!==1?"s":""})</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-black text-black">PKR {Number(product.price).toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-gray-400 line-through">PKR {Number(product.original_price).toLocaleString()}</span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    -{Math.round(((product.original_price-product.price)/product.original_price)*100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className={`text-sm font-semibold mb-5 ${available>0 ? (available<=5?"text-orange-500":"text-green-600") : "text-red-500"}`}>
              {available>0 ? (available<=5 ? `Only ${available} left!` : "✓ In Stock") : "Out of Stock"}
            </p>

            <p className="text-gray-500 leading-relaxed text-sm mb-7">{product.description}</p>

            {/* Quantity */}
            {available > 0 && (
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <motion.button onClick={()=>setQuantity(q=>Math.max(1,q-1))} whileTap={{ scale:0.9 }}
                    className="w-10 h-10 rounded-full border-2 font-bold text-lg flex items-center justify-center hover:border-black transition">−</motion.button>
                  <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                  <motion.button onClick={()=>setQuantity(q=>Math.min(available,q+1))} whileTap={{ scale:0.9 }}
                    className="w-10 h-10 rounded-full border-2 font-bold text-lg flex items-center justify-center hover:border-black transition">+</motion.button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <motion.button onClick={handleAddToCart} disabled={available===0}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wider disabled:opacity-50 transition"
                style={{ background: added?"#22c55e":"#000", color:"#fff" }}
                whileTap={{ scale:0.97 }}>
                <FaShoppingCart />
                {available===0 ? "Out of Stock" : added ? "Added to Cart!" : "Add to Cart"}
              </motion.button>
              <motion.button onClick={()=>toggleWishlist(product)} whileTap={{ scale:0.9 }}
                className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl flex-shrink-0 transition"
                style={{ borderColor: wishlisted?"#ef4444":"#e5e7eb", color: wishlisted?"#ef4444":"#9ca3af" }}>
                <FaHeart />
              </motion.button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t">
              {perks.map(({ icon, label })=>(
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-gray-400 text-lg">{icon}</span>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp order option */}
            <div className="mt-6 p-4 bg-green-50 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-800 text-sm">Prefer WhatsApp?</p>
                <p className="text-green-700 text-xs">Order directly and get personalised service</p>
              </div>
              <a href="https://wa.me/923146063795" target="_blank" rel="noreferrer">
                <motion.button whileTap={{ scale:0.97 }}
                  className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-bold whitespace-nowrap">
                  Chat Now
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* ── Customer Reviews ── */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {/* Existing reviews */}
          <div>
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily:"'Georgia', serif" }}>
              Customer Reviews {reviews.length > 0 && <span className="text-gray-400 text-lg">({reviews.length})</span>}
            </h2>
            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
                <FaStar className="text-4xl mx-auto mb-3 text-gray-200"/>
                <p className="font-semibold">No reviews yet</p>
                <p className="text-sm mt-1">Be the first to review this watch</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, i)=>(
                  <motion.div key={review.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-black">
                          {(review.users?.name||review.guest_name||"G")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{review.users?.name||review.guest_name||"Customer"}</p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s=>(
                          <FaStar key={s} className={`text-xs ${s<=review.rating?"text-yellow-400":"text-gray-200"}`}/>
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 leading-relaxed italic">"{review.comment}"</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Review form */}
          <div>
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily:"'Georgia', serif" }}>Leave a Review</h2>
            <ReviewForm productId={product.id} onReviewAdded={()=>setReviewsKey(k=>k+1)} />
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily:"'Georgia', serif" }}>You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p,i)=>(
                <motion.div key={p.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}>
                  <ProductCard id={p.id} image={p.image} name={p.name} price={p.price}
                    originalPrice={p.original_price} category={p.category} badge={p.badge} rating={p.rating}/>
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
