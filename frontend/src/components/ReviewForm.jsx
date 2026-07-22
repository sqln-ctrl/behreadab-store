import { useState } from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { productsAPI } from "../services/api";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");
  const [hover,   setHover]   = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return (
    <div className="bg-gray-50 rounded-2xl p-6 text-center">
      <p className="text-gray-600 font-medium mb-3">Want to leave a review?</p>
      <Link to="/login">
        <motion.button whileTap={{ scale:0.97 }} className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-bold">
          Sign In to Review
        </motion.button>
      </Link>
    </div>
  );

  if (success) return (
    <div className="bg-green-50 rounded-2xl p-6 text-center">
      <p className="text-2xl mb-2">✓</p>
      <p className="text-green-700 font-bold">Review submitted!</p>
      <p className="text-green-600 text-sm mt-1">Thank you for your feedback. It may appear after admin approval.</p>
    </div>
  );

  const handleSubmit = async () => {
    if (!comment.trim()) return setError("Please write a review");
    setSaving(true); setError("");
    try {
      await productsAPI.addReview(productId, { rating, comment });
      setSuccess(true);
      onReviewAdded?.();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit review");
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="font-black text-lg mb-5">Write a Review</h3>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(s => (
            <motion.button key={s} type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              whileTap={{ scale: 0.85 }}>
              <FaStar className={`text-2xl transition-colors ${s <= (hover || rating) ? "text-yellow-400" : "text-gray-200"}`} />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your Review</p>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
          placeholder="Share your experience with this watch..."
          className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition resize-none" />
      </div>

      <motion.button onClick={handleSubmit} disabled={saving} whileTap={{ scale:0.97 }}
        className="px-8 py-3 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60">
        {saving ? "Submitting..." : "Submit Review"}
      </motion.button>

      <p className="text-xs text-gray-400 mt-2">Reviews are visible after admin approval</p>
    </div>
  );
};

export default ReviewForm;
