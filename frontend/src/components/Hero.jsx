import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { adminAPI, productsAPI } from "../services/api";

const Hero = () => {
  const [config,  setConfig]  = useState(null);
  const [product, setProduct] = useState(null);
  const [loaded,  setLoaded]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getHeroConfig().then(async ({ data }) => {
      setConfig(data);
      if (data.featured_product_id) {
        try {
          const { data: prod } = await productsAPI.getById(data.featured_product_id);
          setProduct(prod);
        } catch (e) {}
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return (
    <section className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border border-white/20 border-t-white animate-spin" />
    </section>
  );

  const headline      = config?.headline      || "Andaaz";
  const subheadline   = config?.subheadline   || "اندازِ وقت";
  const subtext       = config?.subtext       || "Premium watches crafted for those who understand that time is not just measured — it is worn.";
  const ctaText       = config?.cta_text      || "Shop Now";
  const discountText  = config?.discount_text || "";
  const fromPrice     = config?.from_price;
  const imageIndex    = config?.featured_image_index || 0;
  const heroImage     = product
    ? (product.images?.[imageIndex] || product.image || "")
    : (config?.image_url || "");
  const isVideo       = heroImage && /\.(mp4|webm|mov)$/i.test(heroImage);

  return (
    <section className="relative bg-black min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Background media */}
      {heroImage && (
        <div className="absolute inset-0">
          {isVideo ? (
            <video src={heroImage} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-25" />
          ) : (
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.3))" }} />
        </div>
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 py-16 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          {discountText && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-block mb-4 text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 text-white/80 uppercase tracking-widest">
              🏷️ {discountText}
            </motion.div>
          )}

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="uppercase tracking-[0.35em] text-xs mb-3 text-white/40">
            Luxury Timepieces
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="text-5xl md:text-7xl font-black leading-none text-white mb-2"
            style={{ fontFamily: "'Georgia', serif" }}>
            {headline}
          </motion.h1>

          {subheadline && (
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-light text-white/50 mb-4"
              style={{ fontFamily: "'Georgia', serif" }}>
              {subheadline}
            </motion.p>
          )}

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0 mb-8">
            {subtext}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
            className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <Link to="/shop">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-3.5 font-bold text-black text-sm tracking-widest uppercase bg-white rounded-xl">
                {ctaText}
              </motion.button>
            </Link>
            {product && (
              <motion.button onClick={() => navigate(`/product/${product.id}`)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-3.5 font-semibold text-white border border-white/20 rounded-xl text-sm tracking-widest uppercase hover:border-white/50 transition">
                View Watch →
              </motion.button>
            )}
          </motion.div>

          {fromPrice && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.54 }}
              className="mt-4 text-white/30 text-xs">
              Starting from <span className="text-white/60 font-bold">PKR {Number(String(fromPrice).replace(/,/g,"")).toLocaleString()}</span>
            </motion.p>
          )}
        </div>

        {/* Product card — desktop only */}
        {product && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="hidden md:block flex-shrink-0 w-56 cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}>
            <div className="relative">
              <motion.img
                src={product.images?.[imageIndex] || product.image}
                alt={product.name}
                className="w-full rounded-2xl object-cover aspect-square"
                style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-xl shadow-xl whitespace-nowrap">
                <p className="text-xs text-gray-500 text-center">{product.category}</p>
                <p className="font-black text-sm text-center">PKR {Number(product.price).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Hero;
