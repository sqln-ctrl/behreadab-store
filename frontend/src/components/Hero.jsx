import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import FeaturedWatches from "./FeaturedWatches";
import Categories from "./Categories";

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(14)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 3 + 1 + "px",
          height: Math.random() * 3 + 1 + "px",
          background: i % 3 === 0 ? "#d4af37" : "#ffffff",
          left: Math.random() * 100 + "%",
          top: Math.random() * 100 + "%",
          opacity: Math.random() * 0.4 + 0.1,
        }}
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1] }}
        transition={{
          duration: Math.random() * 5 + 4,
          repeat: Infinity,
          delay: Math.random() * 4,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const RevealOnScroll = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Hero = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.7, delay: i * 0.16, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <>
      <section className="relative bg-black text-white overflow-hidden min-h-screen md:min-h-[92vh] flex items-center">
        {/* Glow */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <Particles />

        <div className="relative w-full max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
          {/* Text */}
          <div className="w-full md:max-w-xl z-10 text-center md:text-left">
            <motion.p custom={0} variants={textVariants} initial="hidden" animate="visible"
              className="uppercase tracking-[0.3em] text-xs md:text-sm mb-4"
              style={{ color: "#d4af37" }}>
              Luxury Timepieces
            </motion.p>

            <div className="overflow-hidden">
              <motion.h1 custom={1} variants={textVariants} initial="hidden" animate="visible"
                className="text-5xl md:text-7xl font-black leading-none tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}>
                Timeless
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1 custom={2} variants={textVariants} initial="hidden" animate="visible"
                className="text-5xl md:text-7xl font-black leading-none tracking-tight"
                style={{ fontFamily: "'Georgia', serif", color: "#d4af37" }}>
                Elegance.
              </motion.h1>
            </div>

            <motion.p custom={3} variants={textVariants} initial="hidden" animate="visible"
              className="mt-5 text-gray-400 text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              Premium watches crafted for style, precision, and performance — built to outlast every moment.
            </motion.p>

            <motion.div custom={4} variants={textVariants} initial="hidden" animate="visible"
              className="mt-8 flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <Link to="/shop">
                <motion.button
                  className="px-8 py-3.5 font-bold text-black rounded-xl text-sm tracking-widest uppercase"
                  style={{ background: "#d4af37" }}
                  whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(212,175,55,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Shop Now
                </motion.button>
              </Link>
              <motion.button
                className="px-8 py-3.5 font-semibold text-white border border-white/20 rounded-xl text-sm tracking-widest uppercase"
                whileHover={{ borderColor: "rgba(255,255,255,0.6)", scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Our Story
              </motion.button>
            </motion.div>

            <motion.div custom={5} variants={textVariants} initial="hidden" animate="visible"
              className="mt-12 flex gap-8 justify-center md:justify-start">
              {[{ num: "500+", label: "Watches" }, { num: "12k+", label: "Customers" }, { num: "4.9★", label: "Rating" }].map(({ num, label }) => (
                <div key={label}>
                  <p className="text-xl md:text-2xl font-black" style={{ color: "#d4af37" }}>{num}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image — hidden on small, shown md+ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 hidden md:block flex-shrink-0"
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.2) 30%, transparent 70%)", transform: "scale(1.25)" }}
              animate={{ scale: [1.25, 1.4, 1.25] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=85"
              alt="Luxury Watch"
              className="relative w-80 lg:w-[400px] rounded-2xl"
              style={{ boxShadow: "0 40px 90px rgba(0,0,0,0.7), 0 0 50px rgba(212,175,55,0.12)" }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-4 -left-6 bg-white text-black px-4 py-2.5 rounded-xl shadow-2xl"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest">New Arrival</p>
              <p className="font-black text-sm">Swiss Collection 2025</p>
            </motion.div>
            <motion.div
              className="absolute -top-3 -right-5 rounded-xl px-4 py-2.5 shadow-2xl"
              style={{ background: "#d4af37" }}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <p className="text-xs font-bold text-black uppercase tracking-wider">From</p>
              <p className="font-black text-black text-lg">$199</p>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #000)" }} />
      </section>

      <RevealOnScroll><FeaturedWatches /></RevealOnScroll>
      <RevealOnScroll delay={0.1}><Categories /></RevealOnScroll>
    </>
  );
};

export default Hero;
