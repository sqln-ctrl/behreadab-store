import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaPlus, FaTrash, FaTimes, FaCheckCircle, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { reviewsAPI, productsAPI } from "../../services/api";

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((s) => (
      <button key={s} type="button" onClick={() => onChange?.(s)}>
        <FaStar className={`text-xl ${s <= value ? "text-yellow-400" : "text-gray-200"} ${onChange ? "cursor-pointer hover:text-yellow-300 transition" : ""}`} />
      </button>
    ))}
  </div>
);

const AdminReviews = () => {
  const [reviews,   setReviews]   = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all"); // all | featured
  const [modal,     setModal]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [form,      setForm]      = useState({ product_id: "", customer_name: "", rating: 5, comment: "", source: "whatsapp", is_featured: true });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = filter === "featured" ? { featured: "true" } : {};
      const { data } = await reviewsAPI.getAll(params);
      setReviews(data.reviews || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  useEffect(() => {
    productsAPI.getAll({ limit: 100 }).then(({ data }) => setProducts(data.products || [])).catch(console.error);
  }, []);

  const handleToggleFeature = async (review) => {
    try {
      await reviewsAPI.feature(review.id, { is_featured: !review.is_featured });
      fetchReviews();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try { await reviewsAPI.delete(id); fetchReviews(); } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.customer_name) return setError("Product and customer name required");
    setSaving(true); setError("");
    try {
      await reviewsAPI.createManual(form);
      setModal(false);
      setForm({ product_id: "", customer_name: "", rating: 5, comment: "", source: "whatsapp", is_featured: true });
      fetchReviews();
    } catch (e) { setError(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const SOURCE_ICONS = { whatsapp: <FaWhatsapp className="text-green-500" />, instagram: <FaInstagram className="text-pink-500" />, manual: <FaStar className="text-yellow-500" />, website: <FaCheckCircle className="text-blue-500" /> };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Reviews</h1>
          <p className="text-gray-400 text-sm mt-1">{reviews.length} reviews</p>
        </div>
        <motion.button onClick={() => { setModal(true); setError(""); }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm bg-black">
          <FaPlus /> Add Manual Review
        </motion.button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "featured"].map((f) => (
          <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition border"
            style={{ background: filter === f ? "#000" : "white", color: filter === f ? "#fff" : "#6b7280", borderColor: filter === f ? "#000" : "#e5e7eb" }}>
            {f === "all" ? "All Reviews" : "⭐ Featured (on homepage)"}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
              <FaStar className="text-5xl mx-auto mb-4 text-gray-200" />
              <p className="font-semibold">No reviews yet</p>
            </div>
          )}
          {reviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition ${review.is_featured ? "border-yellow-300" : "border-transparent"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                    {(review.users?.name || review.guest_name || "G")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-gray-900">{review.users?.name || review.guest_name || "Guest"}</p>
                      {SOURCE_ICONS[review.source] && <span title={review.source}>{SOURCE_ICONS[review.source]}</span>}
                    </div>
                    <p className="text-xs text-gray-400">{review.products?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button onClick={() => handleToggleFeature(review)} whileTap={{ scale: 0.9 }}
                    title={review.is_featured ? "Remove from homepage" : "Show on homepage"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${review.is_featured ? "bg-yellow-100 text-yellow-500" : "bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-400"}`}>
                    <FaStar className="text-xs" />
                  </motion.button>
                  <motion.button onClick={() => handleDelete(review.id)} whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                    <FaTrash className="text-xs" />
                  </motion.button>
                </div>
              </div>

              <StarRating value={review.rating} />

              {review.comment && <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">"{review.comment}"</p>}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                {review.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">On Homepage</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Manual Review Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-xl">Add Manual Review</h2>
                <button onClick={() => setModal(false)}><FaTimes className="text-gray-400" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-5">For customers who reviewed on WhatsApp or Instagram</p>

              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Product *</label>
                  <select value={form.product_id} onChange={(e) => setForm(f => ({ ...f, product_id: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                    <option value="">Select product</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Customer Name *</label>
                  <input value={form.customer_name} onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    placeholder="Ali Khan" className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">Rating *</label>
                  <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Review Text</label>
                  <textarea value={form.comment} onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={3} placeholder="What they said about the product..."
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Source</label>
                  <div className="flex gap-2">
                    {["whatsapp", "instagram", "manual"].map((s) => (
                      <motion.button key={s} type="button" onClick={() => setForm(f => ({ ...f, source: s }))} whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition"
                        style={{ background: form.source === s ? "#000" : "white", color: form.source === s ? "#fff" : "#6b7280", borderColor: form.source === s ? "#000" : "#e5e7eb" }}>
                        {SOURCE_ICONS[s]} {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="featured" checked={form.is_featured} onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Show on homepage (Featured)</label>
                </div>
                <motion.button onClick={handleCreate} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-widest disabled:opacity-60 bg-black">
                  {saving ? "Adding..." : "Add Review"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReviews;
