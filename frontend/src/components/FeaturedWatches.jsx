import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductCard from "./ProductCard";

const featuredWatches = [
  { id: 1, name: "Rolex Submariner", price: 85000, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80", badge: "Bestseller", category: "Men", rating: 4.8, reviews: 124 },
  { id: 2, name: "Omega Seamaster", price: 72000, image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&q=80", badge: "New", category: "Men", rating: 4.6, reviews: 89 },
  { id: 3, name: "Rose Gold Elegance", price: 58000, image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80", badge: "Top Rated", category: "Women", rating: 4.9, reviews: 201 },
];

const FeaturedWatches = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-white py-20 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <p className="uppercase tracking-[0.35em] text-xs mb-3 text-black/40">Curated Selection</p>
          <h2 className="text-4xl font-black text-black" style={{ fontFamily: "'Georgia', serif" }}>Featured Watches</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredWatches.map((watch, i) => (
            <motion.div key={watch.id}
              initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <ProductCard {...watch} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWatches;
