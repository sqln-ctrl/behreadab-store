import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FaStar, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { reviewsAPI } from "../services/api";

const SOURCE_BADGE = {
  whatsapp:  { icon: <FaWhatsapp className="text-xs" />, label: "WhatsApp", bg: "#dcfce7", text: "#166534" },
  instagram: { icon: <FaInstagram className="text-xs" />, label: "Instagram", bg: "#fce7f3", text: "#9d174d" },
  website:   { label: "Verified", bg: "#dbeafe", text: "#1e40af" },
  manual:    { label: "Verified", bg: "#f3f4f6", text: "#374151" },
};

const ReviewCard = ({ review, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const name   = review.users?.name || review.guest_name || "Customer";
  const source = SOURCE_BADGE[review.source] || SOURCE_BADGE.manual;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {[1,2,3,4,5].map((s) => (
          <FaStar key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`} />
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed italic flex-1">"{review.comment || "Great product!"}"</p>
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            {review.products?.name && <p className="text-xs text-gray-400 truncate max-w-[120px]">{review.products.name}</p>}
          </div>
        </div>
        {source && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: source.bg, color: source.text }}>
            {source.icon} {source.label}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    reviewsAPI.getFeatured().then(({ data }) => setReviews(data)).catch(console.error);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section ref={ref} className="bg-white py-16 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <p className="uppercase tracking-[0.3em] text-xs mb-2 text-black/40">Reviews</p>
          <h2 className="text-3xl font-black text-black" style={{ fontFamily: "'Georgia', serif" }}>What Our Customers Say</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
