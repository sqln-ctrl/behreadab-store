import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { adminAPI, productsAPI } from "../services/api";

const Hero = () => {
  const [config,  setConfig]  = useState(null);
  const [product, setProduct] = useState(null);
  const [loaded,  setLoaded]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getHeroConfig().then(async ({ data }) => {
      setConfig(data);
      if (data?.featured_product_id) {
        try { const { data: prod } = await productsAPI.getById(data.featured_product_id); setProduct(prod); } catch {}
      }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  // Show nothing until loaded to prevent flash
  if (!loaded) return (
    <section className="bg-black flex items-center justify-center" style={{ minHeight:"100vh" }}>
      <div className="w-8 h-8 rounded-full border border-white/20 border-t-white animate-spin" />
    </section>
  );

  const c = config || {};
  const headline      = c.headline      || "Andaaz";
  const subheadline   = c.subheadline   || "اندازِ وقت";
  const subtext       = c.subtext       || "Premium watches crafted for those who understand that time is not just measured — it is worn.";
  const ctaText       = c.cta_text      || "Shop Now";
  const discountText  = c.discount_text || "";
  const fromPrice     = c.from_price;
  const heroHeight    = c.hero_height   || "100vh";
  const bgOpacity     = (c.bg_opacity   ?? 20) / 100;
  const showBg        = c.show_bg_media !== false;
  const imageUrl      = c.image_url     || "";
  const productSize   = c.product_size  || 280;
  const productPos    = c.product_position || "right";
  const imgIndex      = c.featured_image_index || 0;

  const isVideo       = imageUrl && /\.(mp4|webm|mov)$/i.test(imageUrl);
  const productImages = product?.images?.length ? product.images : (product?.image ? [product.image] : []);
  const activeImg     = productImages[imgIndex] || "";

  const isCenter = productPos === "center";
  const flexDir  = productPos === "left" ? "md:flex-row-reverse" : "md:flex-row";

  return (
    <section className="relative bg-black text-white overflow-hidden" style={{ minHeight: heroHeight }}>
      {/* Background */}
      {showBg && imageUrl && (
        <div className="absolute inset-0">
          {isVideo ? (
            <video src={imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ opacity: bgOpacity }} />
          ) : (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: bgOpacity }} />
          )}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: productPos === "right"
          ? "linear-gradient(to right, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.4))"
          : productPos === "left"
          ? "linear-gradient(to left, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.4))"
          : "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5))" }} />

      {/* Content */}
      <div className={`relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 flex flex-col ${isCenter ? "items-center text-center" : `${flexDir} items-center`} gap-10 md:gap-16`}
        style={{ minHeight: heroHeight }}>

        {/* Text */}
        <div className={`${isCenter ? "max-w-2xl" : "flex-1"} ${isCenter ? "" : "text-center md:text-left"}`}>
          {discountText && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="inline-block mb-4 text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 text-white/80 uppercase tracking-widest">
              🏷️ {discountText}
            </motion.div>
          )}

          <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="uppercase tracking-[0.35em] text-xs mb-3 text-white/40">
            Luxury Timepieces
          </motion.p>

          <motion.h1 initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
            className="font-black leading-none text-white mb-2"
            style={{ fontFamily:"'Georgia', serif", fontSize:"clamp(2.5rem, 8vw, 5rem)" }}>
            {headline}
          </motion.h1>

          {subheadline && (
            <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="font-light text-white/50 mb-4"
              style={{ fontFamily:"'Georgia', serif", fontSize:"clamp(1.1rem, 3vw, 1.75rem)" }}>
              {subheadline}
            </motion.p>
          )}

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.38 }}
            className="text-white/50 leading-relaxed mb-8 max-w-md mx-auto md:mx-0"
            style={{ fontSize:"clamp(0.875rem, 2vw, 1rem)" }}>
            {subtext}
          </motion.p>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.46 }}
            className={`flex flex-col sm:flex-row gap-3 ${isCenter ? "justify-center" : "justify-center md:justify-start"}`}>
            <Link to="/shop">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="w-full sm:w-auto px-8 py-3.5 font-bold text-black text-sm tracking-widest uppercase bg-white rounded-xl">
                {ctaText}
              </motion.button>
            </Link>
            {product && (
              <motion.button onClick={()=>navigate(`/product/${product.id}`)}
                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                className="w-full sm:w-auto px-6 py-3.5 font-semibold text-white border border-white/20 rounded-xl text-sm tracking-widest uppercase hover:border-white/50 transition">
                View This Watch →
              </motion.button>
            )}
          </motion.div>

          {fromPrice && (
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.54 }}
              className="mt-4 text-white/30 text-xs">
              Starting from <span className="text-white/60 font-bold">PKR {Number(String(fromPrice).replace(/,/g,"")).toLocaleString()}</span>
            </motion.p>
          )}
        </div>

        {/* Product image */}
        {product && activeImg && (
          <motion.div
            initial={{ opacity:0, x: productPos==="right" ? 30 : productPos==="left" ? -30 : 0, y: isCenter ? 20 : 0 }}
            animate={{ opacity:1, x:0, y:0 }}
            transition={{ delay:0.5, duration:0.6 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={()=>navigate(`/product/${product.id}`)}>
            <div className="relative">
              <motion.img src={activeImg} alt={product.name}
                className="rounded-2xl object-cover"
                style={{ width: productSize, height: productSize, maxWidth:"90vw", boxShadow:"0 30px 80px rgba(0,0,0,0.8)" }}
                animate={{ y:[0,-10,0] }} transition={{ duration:5, repeat:Infinity, ease:"easeInOut" }} />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2.5 rounded-xl shadow-2xl whitespace-nowrap">
                <p className="text-xs text-gray-500 text-center">{product.category}'s Collection</p>
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
