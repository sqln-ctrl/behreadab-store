import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  { id: 1, name: "Ali Khan", role: "Watch Collector", review: "Excellent quality and fast delivery. The watch exceeded my expectations in every way." },
  { id: 2, name: "Sarah Ahmed", role: "Verified Buyer", review: "Beautiful design and premium packaging. Every detail is perfectly crafted." },
  { id: 3, name: "Usman Tariq", role: "Loyal Customer", review: "Affordable prices with a true luxury feel. Will definitely come back for more." },
];

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-white py-20 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <p className="uppercase tracking-[0.35em] text-xs mb-3 text-black/40">Reviews</p>
          <h2 className="text-4xl font-black text-black" style={{ fontFamily: "'Georgia', serif" }}>What Our Customers Say</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.08)" }}
              className="bg-white p-8 rounded-2xl border border-gray-100 transition-shadow duration-300">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, s) => (
                  <span key={s} className="text-black text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6 italic">"{item.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
