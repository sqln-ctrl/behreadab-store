import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaPlus, FaMinus, FaSync, FaTimes } from "react-icons/fa";
import { inventoryAPI } from "../../services/api";

const TYPE_COLORS = {
  sale:       { bg: "#fee2e2", text: "#991b1b" },
  restock:    { bg: "#dcfce7", text: "#166534" },
  adjustment: { bg: "#dbeafe", text: "#1e40af" },
  return:     { bg: "#ede9fe", text: "#5b21b6" },
  damaged:    { bg: "#fef3c7", text: "#92400e" },
};

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stock"); // stock | transactions
  const [adjustModal, setAdjustModal] = useState(null); // product
  const [adjustForm, setAdjustForm] = useState({ qty_change: "", type: "adjustment", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invRes, txRes] = await Promise.all([
        inventoryAPI.getStock(),
        inventoryAPI.getTransactions({ limit: 50 }),
      ]);
      setInventory(invRes.data);
      setTransactions(txRes.data.transactions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleAdjust = async () => {
    if (!adjustForm.qty_change) return setError("Enter quantity");
    setSaving(true); setError("");
    try {
      await inventoryAPI.adjustStock({
        product_id: adjustModal.product_id,
        qty_change:  Number(adjustForm.qty_change),
        type:        adjustForm.type,
        notes:       adjustForm.notes,
      });
      setAdjustModal(null);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  const lowStock = inventory.filter((i) => i.is_low_stock);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Inventory</h1>
          <p className="text-gray-400 text-sm mt-1">{inventory.length} products tracked</p>
        </div>
        <motion.button onClick={fetchInventory} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:border-gray-400 transition">
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </motion.button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-yellow-500" />
            <p className="font-bold text-yellow-800 text-sm">{lowStock.length} product{lowStock.length > 1 ? "s" : ""} below reorder point</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item.id} className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                {item.products?.name} ({item.stock_qty} left)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {["stock", "transactions"].map((t) => (
          <motion.button key={t} onClick={() => setTab(t)} whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition"
            style={{ background: tab === t ? "#d4af37" : "white", color: tab === t ? "#000" : "#6b7280", border: "1px solid", borderColor: tab === t ? "#d4af37" : "#e5e7eb" }}>
            {t === "stock" ? "Stock Levels" : "Transaction Log"}
          </motion.button>
        ))}
      </div>

      {/* Stock levels table */}
      {tab === "stock" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Product", "In Stock", "Reserved", "Available", "Reorder At", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && <tr><td colSpan={7} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin mx-auto" /></td></tr>}
                {!loading && inventory.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No inventory records</td></tr>}
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.products?.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <p className="font-semibold text-gray-800 text-sm">{item.products?.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-800">{item.stock_qty}</td>
                    <td className="px-5 py-4 text-gray-500">{item.reserved_qty}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: item.available_qty < 3 ? "#ef4444" : "#22c55e" }}>{item.available_qty}</td>
                    <td className="px-5 py-4 text-gray-500">{item.reorder_point}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.is_low_stock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {item.is_low_stock ? "Low Stock" : "OK"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <motion.button
                        onClick={() => { setAdjustModal(item); setAdjustForm({ qty_change: "", type: "adjustment", notes: "" }); setError(""); }}
                        whileTap={{ scale: 0.9 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:border-yellow-400 transition">
                        Adjust
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions log */}
      {tab === "transactions" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Product", "Type", "Qty Change", "Notes", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && <tr><td colSpan={5} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin mx-auto" /></td></tr>}
                {transactions.map((tx) => {
                  const style = TYPE_COLORS[tx.type] || { bg: "#f3f4f6", text: "#374151" };
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-800">{tx.products?.name}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                          style={{ background: style.bg, color: style.text }}>{tx.type}</span>
                      </td>
                      <td className="px-5 py-4 font-bold" style={{ color: tx.qty_change > 0 ? "#22c55e" : "#ef4444" }}>
                        {tx.qty_change > 0 ? `+${tx.qty_change}` : tx.qty_change}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-xs truncate">{tx.notes || "—"}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust modal */}
      <AnimatePresence>
        {adjustModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAdjustModal(null)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg">Adjust Stock</h2>
                <button onClick={() => setAdjustModal(null)}><FaTimes className="text-gray-400" /></button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                <img src={adjustModal.products?.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-sm">{adjustModal.products?.name}</p>
                  <p className="text-xs text-gray-400">Current stock: <span className="font-bold text-gray-700">{adjustModal.stock_qty}</span></p>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl mb-4">{error}</p>}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Type</label>
                  <select value={adjustForm.type} onChange={(e) => setAdjustForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 bg-white">
                    {["restock", "adjustment", "damaged", "return"].map((t) => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">
                    Quantity Change <span className="text-gray-400 font-normal normal-case">(use negative to remove)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => setAdjustForm((f) => ({ ...f, qty_change: String(Number(f.qty_change || 0) - 1) }))}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200 transition">
                      <FaMinus className="text-xs" />
                    </motion.button>
                    <input type="number" value={adjustForm.qty_change}
                      onChange={(e) => setAdjustForm((f) => ({ ...f, qty_change: e.target.value }))}
                      className="flex-1 border rounded-xl px-4 py-2.5 text-sm text-center outline-none focus:border-yellow-400" />
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => setAdjustForm((f) => ({ ...f, qty_change: String(Number(f.qty_change || 0) + 1) }))}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200 transition">
                      <FaPlus className="text-xs" />
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Notes</label>
                  <input value={adjustForm.notes} onChange={(e) => setAdjustForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Reason for adjustment..."
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400" />
                </div>
                <motion.button onClick={handleAdjust} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-60"
                  style={{ background: "#d4af37" }}>
                  {saving ? "Saving..." : "Apply Adjustment"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInventory;
