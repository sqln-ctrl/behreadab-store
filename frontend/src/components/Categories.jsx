import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const categories = [
  { id: 1, name: "Men's Watches", sub: "Bold. Precise. Commanding.", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=85" },
  { id: 2, name: "Women's Watches", sub: "Elegant. Refined. Timeless.", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=85" },
];

const Categories = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-8 py-20">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="uppercase tracking-[0.35em] text-sm mb-3" style={{ color: "#d4af37" }}>
          Explore
        </p>
        <h2 className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
          Shop By Category
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            className="relative overflow-hidden rounded-2xl cursor-pointer h-96"
            initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover="hover"
          >
            <motion.img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover"
              variants={{ hover: { scale: 1.07 } }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%)" }} />

            {/* Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-8 text-center">
              <motion.p
                className="text-xs uppercase tracking-[0.3em] mb-2"
                style={{ color: "#d4af37" }}
                variants={{ hover: { letterSpacing: "0.4em" } }}
                transition={{ duration: 0.3 }}
              >
                {cat.sub}
              </motion.p>
              <h3 className="text-white text-3xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
                {cat.name}
              </h3>

              <motion.button
                className="mt-5 px-7 py-2.5 border border-white/50 text-white text-xs uppercase tracking-widest rounded-lg font-semibold"
                variants={{ hover: { borderColor: "#d4af37", color: "#d4af37", y: -3 } }}
                transition={{ duration: 0.2 }}
              >
                Explore →
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
