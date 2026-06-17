import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import FeaturedWatches from "./FeaturedWatches";
import Categories from "./Categories";
import Testimonials from "./Testimonials";
import useHeroConfig from "../hooks/useHeroConfig";

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(14)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{
          width:   Math.random() * 2 + 1 + "px",
          height:  Math.random() * 2 + 1 + "px",
          background: "#ffffff",
          left:    Math.random() * 100 + "%",
          top:     Math.random() * 100 + "%",
          opacity: Math.random() * 0.3 + 0.05,
        }}
        animate={{ y: [0, -30, 0], opacity: [0.05, 0.3, 0.05] }}
        transition={{ duration: Math.random() * 5 + 4, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const RevealOnScroll = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

const textVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.16, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Hero = () => {
  const { config, loading } = useHeroConfig();

  // Fallback defaults while loading
  const headline      = config?.headline      || "Andaaz";
  const subheadline   = config?.subheadline   || "اندازِ وقت";
  const subtext       = config?.subtext       || "Premium watches crafted for those who understand that time is not just measured — it is worn.";
  const imageUrl      = config?.image_url     || "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=85";
  const badgeText     = config?.badge_text    || "New Arrival";
  const badgeSub      = config?.badge_sub     || "Swiss Collection 2025";
  const fromPrice     = config?.from_price    || "48,000";
  const discountText  = config?.discount_text || "";
  const ctaText       = config?.cta_text      || "Shop Now";

  // Detect if image_url is a video
  const isVideo = imageUrl && /\.(mp4|webm|mov|ogg)$/i.test(imageUrl);

  return (
    <>
      <section className="relative bg-black text-white overflow-hidden min-h-screen flex items-center">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize:  "60px 60px",
        }} />

        <Particles />

        <div className="relative w-full max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
          {/* Text */}
          <div className="w-full md:max-w-xl z-10 text-center md:text-left">
            {/* Logo mark */}
            <motion.div custom={0} variants={textVariants} initial="hidden" animate="visible"
              className="flex items-center gap-3 mb-8 justify-center md:justify-start">
              <img src="/logo.jpg" alt="Andaaz" className="h-14 w-14 rounded-full object-cover"
                style={{ filter: "invert(1)" }} />
              <span className="text-white/40 text-xs uppercase tracking-[0.4em]">Est. 2025</span>
            </motion.div>

            {/* Discount banner */}
            {discountText && (
              <motion.div custom={0.5} variants={textVariants} initial="hidden" animate="visible"
                className="inline-block mb-4 text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 text-white/80 uppercase tracking-widest">
                🏷️ {discountText}
              </motion.div>
            )}

            <motion.p custom={1} variants={textVariants} initial="hidden" animate="visible"
              className="uppercase tracking-[0.35em] text-xs mb-4 text-white/50">
              Luxury Timepieces
            </motion.p>

            <div className="overflow-hidden">
              <motion.h1 custom={2} variants={textVariants} initial="hidden" animate="visible"
                className="text-6xl md:text-8xl font-black leading-none tracking-tight text-white"
                style={{ fontFamily: "'Georgia', serif" }}>
                {headline}
              </motion.h1>
            </div>

            {subheadline && (
              <div className="overflow-hidden">
                <motion.h2 custom={3} variants={textVariants} initial="hidden" animate="visible"
                  className="text-2xl md:text-3xl font-light leading-snug tracking-widest text-white/60 mt-2"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {subheadline}
                </motion.h2>
              </div>
            )}

            <motion.p custom={4} variants={textVariants} initial="hidden" animate="visible"
              className="mt-6 text-white/50 text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              {subtext}
            </motion.p>

            <motion.div custom={5} variants={textVariants} initial="hidden" animate="visible"
              className="mt-10 flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <Link to="/shop">
                <motion.button
                  className="px-8 py-3.5 font-bold text-black text-sm tracking-widest uppercase bg-white rounded-xl"
                  whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.97 }}>
                  {ctaText}
                </motion.button>
              </Link>
              <motion.button
                className="px-8 py-3.5 font-semibold text-white border border-white/20 rounded-xl text-sm tracking-widest uppercase"
                whileHover={{ borderColor: "rgba(255,255,255,0.6)", scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                Our Story
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div custom={6} variants={textVariants} initial="hidden" animate="visible"
              className="mt-14 flex gap-10 justify-center md:justify-start">
              {[
                { num: "500+",       label: "Watches" },
                { num: "12k+",       label: "Customers" },
                { num: "4.9★",       label: "Rating" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{num}</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image / Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 hidden md:block flex-shrink-0">
            <div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 30%, transparent 70%)", transform: "scale(1.4)" }} />

            {isVideo ? (
              <video
                src={imageUrl}
                autoPlay loop muted playsInline
                className="relative w-80 lg:w-[400px] rounded-2xl object-cover"
                style={{ boxShadow: "0 40px 90px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)", maxHeight: "480px" }}
              />
            ) : (
              <motion.img
                src={imageUrl}
                alt="Luxury Watch"
                className="relative w-80 lg:w-[400px] rounded-2xl"
                style={{ boxShadow: "0 40px 90px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)" }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Floating badge */}
            {badgeText && (
              <motion.div
                className="absolute -bottom-4 -left-6 bg-white text-black px-4 py-2.5 rounded-xl shadow-2xl"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{badgeText}</p>
                <p className="font-black text-sm">{badgeSub}</p>
              </motion.div>
            )}

            {/* Price tag */}
            {fromPrice && (
              <motion.div
                className="absolute -top-3 -right-5 bg-black border border-white/20 text-white px-4 py-2.5 rounded-xl shadow-2xl"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">From</p>
                <p className="font-black text-lg">PKR {Number(fromPrice.replace(/,/g, "")).toLocaleString()}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #000)" }} />
      </section>

      <RevealOnScroll><FeaturedWatches /></RevealOnScroll>
      <RevealOnScroll delay={0.1}><Categories /></RevealOnScroll>
      <RevealOnScroll delay={0.1}><Testimonials /></RevealOnScroll>
    </>
  );
};

export default Hero;
