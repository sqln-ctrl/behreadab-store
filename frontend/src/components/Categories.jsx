import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../services/api";

const Categories = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.get('/categories?featured=true')
      .then(({ data }) => setCategories(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section ref={ref} className="bg-black py-14 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-10"
          initial={{ opacity:0, y:20 }} animate={isInView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}>
          <p className="uppercase tracking-[0.3em] text-xs mb-2 text-white/40">Explore</p>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily:"'Georgia', serif" }}>Shop by Category</h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{ height:"200px" }}/>)}
          </div>
        ) : (
          <div className={`grid gap-4 ${categories.length === 1 ? "grid-cols-1 max-w-md mx-auto" : categories.length === 2 ? "grid-cols-2" : categories.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
            {categories.map((cat, i) => (
              <Link to={`/shop?category=${cat.name}`} key={cat.id}>
                <motion.div className="relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{ height:"clamp(160px, 40vw, 260px)" }}
                  initial={{ opacity:0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={isInView ? { opacity:1, x:0 } : {}}
                  transition={{ duration:0.6, delay:i*0.1 }}
                  whileHover="hover">

                  {cat.image_url ? (
                    <motion.img src={cat.image_url} alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      variants={{ hover:{ scale:1.05 } }} transition={{ duration:0.5 }}/>
                  ) : (
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-6xl text-white/10">⌚</div>
                  )}

                  <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)" }}/>

                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-center px-4">
                    <h3 className="text-white text-xl font-black" style={{ fontFamily:"'Georgia', serif" }}>{cat.name}'s</h3>
                    <motion.span className="mt-2 text-xs text-white/50 border border-white/20 px-3 py-1 rounded-full"
                      variants={{ hover:{ borderColor:"rgba(255,255,255,0.5)", color:"rgba(255,255,255,0.8)" } }}>
                      Shop →
                    </motion.span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
