import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { productsAPI } from "../services/api";

const FeaturedWatches = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    productsAPI.getAll({ featured: "true", limit: 4 })
      .then(({ data }) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section ref={ref} className="bg-white py-14 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}>
          <div>
            <p className="uppercase tracking-[0.3em] text-xs mb-2 text-black/40">Curated Selection</p>
            <h2 className="text-3xl font-black text-black" style={{ fontFamily: "'Georgia', serif" }}>Featured Watches</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-black/40 hover:text-black transition hidden md:block">
            View all →
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" style={{ height: "280px" }} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((watch, i) => (
              <motion.div key={watch.id}
                initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}>
                <ProductCard id={watch.id} image={watch.image} name={watch.name} price={watch.price}
                  originalPrice={watch.original_price} badge={watch.badge} category={watch.category} rating={watch.rating} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Link to="/shop">
            <motion.button whileTap={{ scale: 0.97 }} className="px-8 py-3 rounded-xl bg-black text-white text-sm font-bold">
              View All Watches
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWatches;
