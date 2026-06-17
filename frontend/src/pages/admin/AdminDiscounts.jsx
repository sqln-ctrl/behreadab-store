import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaTimes, FaTag } from "react-icons/fa";
import { discountsAPI, productsAPI } from "../../services/api";

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [form,      setForm]      = useState({
    product_id: "", type: "percentage", value: "", ends_at: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [discRes, prodRes] = await Promise.all([
        discountsAPI.getAllAdmin(),
        productsAPI.getAll({ limit: 100 }),
      ]);
      setDiscounts(discRes.data);
      setProducts(prodRes.data.products);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.product_id || !form.value) return setError("Product and value required");
    setSaving(true); setError("");
    try {
      await discountsAPI.create({
        product_id: form.product_id,
        type:       form.type,
        value:      Number(form.value),
        ends_at:    form.ends_at || null,
      });
      setModal(false);
      setForm({ product_id: "", type: "percentage", value: "", ends_at: "" });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    try { await discountsAPI.remove(id); fetchAll(); }
    catch (err) { console.error(err); }
  };

  const selectedProduct = products.find((p) => p.id === form.product_id);
  const previewPrice = selectedProduct && form.value
    ? form.type === "percentage"
      ? selectedProduct.price - (selectedProduct.price * Number(form.value) / 100)
      : selectedProduct.price - Number(form.value)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Discounts</h1>
          <p className="text-gray-400 text-sm mt-1">{discounts.filter((d) => d.is_active).length} active discounts</p>
        </div>
        <motion.button onClick={() => { setModal(true); setError(""); }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm bg-black">
          <FaPlus /> Add Discount
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Product", "Type", "Discount", "Original", "Sale Price", "Expires", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {discounts.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                    <FaTag className="text-4xl mx-auto mb-3 text-gray-200" />
                    <p>No discounts yet</p>
                  </td></tr>
                )}
                {discounts.map((d) => (
                  <tr key={d.id} className={`hover:bg-gray-50 transition ${!d.is_active ? "opacity-40" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={d.products?.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <p className="font-semibold text-gray-800 text-xs">{d.products?.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 capitalize text-gray-500">{d.type}</td>
                    <td className="px-5 py-4 font-bold text-red-500">
                      {d.type === "percentage" ? `${d.value}%` : `PKR ${Number(d.value).toLocaleString()}`} OFF
                    </td>
                    <td className="px-5 py-4 text-gray-400 line-through text-xs">
                      {d.products?.original_price ? `PKR ${Number(d.products.original_price).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-4 font-black text-black">PKR {Number(d.products?.price).toLocaleString()}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${d.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {d.is_active ? "Active" : "Removed"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {d.is_active && (
                        <motion.button onClick={() => handleRemove(d.id)} whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                          <FaTrash className="text-xs" />
                        </motion.button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-xl">Apply Discount</h2>
                <button onClick={() => setModal(false)}><FaTimes className="text-gray-400" /></button>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Product *</label>
                  <select value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — PKR {Number(p.price).toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Type</label>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (PKR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">
                      Value {form.type === "percentage" ? "(%)" : "(PKR)"}
                    </label>
                    <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      placeholder={form.type === "percentage" ? "20" : "5000"}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Expiry Date (optional)</label>
                  <input type="date" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black" />
                </div>

                {/* Preview */}
                {previewPrice !== null && selectedProduct && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Price Preview</p>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 line-through text-sm">PKR {Number(selectedProduct.price).toLocaleString()}</span>
                      <span className="text-black font-black text-lg">PKR {Number(Math.max(0, previewPrice)).toLocaleString()}</span>
                      <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full">
                        {form.type === "percentage" ? `-${form.value}%` : `-PKR ${Number(form.value).toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Product badge will be set to "Sale"</p>
                  </div>
                )}

                <motion.button onClick={handleCreate} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-widest disabled:opacity-60 bg-black">
                  {saving ? "Applying..." : "Apply Discount"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDiscounts;
