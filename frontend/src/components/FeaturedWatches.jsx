import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductCard from "./ProductCard";
import useProducts from "../hooks/useProducts";
import Loader from "./Loader";

const FeaturedWatches = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { products, loading } = useProducts({ featured: "true", limit: 3 });

  return (
    <section ref={ref} className="bg-white py-20 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <p className="uppercase tracking-[0.35em] text-xs mb-3 text-black/40">Curated Selection</p>
          <h2 className="text-4xl font-black text-black" style={{ fontFamily: "'Georgia', serif" }}>Featured Watches</h2>
        </motion.div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((watch, i) => (
              <motion.div key={watch.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}>
                <ProductCard
                  id={watch.id}
                  image={watch.image}
                  name={watch.name}
                  price={watch.price}
                  originalPrice={watch.original_price}
                  badge={watch.badge}
                  category={watch.category}
                  rating={watch.rating}
                  reviews={watch.num_reviews}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedWatches;
