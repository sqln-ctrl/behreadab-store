import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";

const CATS = [
  { id:"Men",   name:"Men's",   sub:"Bold · Precise", image:"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80" },
  { id:"Women", name:"Women's", sub:"Elegant · Refined", image:"https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80" },
];

const Categories = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-black py-14 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="uppercase tracking-[0.3em] text-xs mb-2 text-white/40">Explore</p>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Georgia', serif" }}>Shop by Category</h2>
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {CATS.map((cat, i) => (
            <Link to={`/shop?category=${cat.id}`} key={cat.id}>
              <motion.div className="relative overflow-hidden rounded-2xl cursor-pointer"
                style={{ height: "clamp(160px, 40vw, 260px)" }}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover="hover">
                <motion.img src={cat.image} alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  variants={{ hover: { scale: 1.05 } }} transition={{ duration: 0.5 }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)" }} />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-center px-4">
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{cat.sub}</p>
                  <h3 className="text-white text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>{cat.name}</h3>
                  <motion.span className="mt-2 text-xs text-white/50 border border-white/20 px-3 py-1 rounded-full"
                    variants={{ hover: { borderColor: "rgba(255,255,255,0.5)", color: "rgba(255,255,255,0.8)" } }}>
                    Shop →
                  </motion.span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
