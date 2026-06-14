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
    <section ref={ref} className="py-20" style={{ background: "#f9f7f4" }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="uppercase tracking-[0.35em] text-sm mb-3" style={{ color: "#d4af37" }}>
            Reviews
          </p>
          <h2 className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.1)" }}
              className="bg-white p-8 rounded-2xl transition-shadow duration-300"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, s) => (
                  <span key={s} style={{ color: "#d4af37", fontSize: "14px" }}>★</span>
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6 italic">
                "{item.review}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: "#d4af37" }}>
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
