import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductCard from "./ProductCard";

const featuredWatches = [
  { id: 1, name: "Rolex Submariner", price: 299, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80" },
  { id: 2, name: "Classic Luxury", price: 249, image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&q=80" },
  { id: 3, name: "Modern Smart Watch", price: 199, image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80" },
];

function FeaturedWatches() {
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
          Curated Selection
        </p>
        <h2 className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
          Featured Watches
        </h2>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredWatches.map((watch, i) => (
          <motion.div
            key={watch.id}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard image={watch.image} name={watch.name} price={watch.price} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedWatches;
