import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaCheck, FaBoxOpen } from "react-icons/fa";
import { inventoryAPI, productsAPI } from "../../services/api";

const STATUS_STYLES = {
  Draft:     { bg: "#f3f4f6", text: "#374151" },
  Sent:      { bg: "#dbeafe", text: "#1e40af" },
  Received:  { bg: "#dcfce7", text: "#166534" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const AdminPurchaseOrders = () => {
  const [pos, setPOs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [receiveModal, setReceiveModal] = useState(null);
  const [form, setForm] = useState({ supplier_id: "", expected_date: "", notes: "", items: [] });
  const [receiveData, setReceiveData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        inventoryAPI.getPurchaseOrders({ status: statusFilter }),
        inventoryAPI.getSuppliers(),
        productsAPI.getAll({ limit: 100 }),
      ]);
      setPOs(poRes.data);
      setSuppliers(supRes.data);
      setProducts(prodRes.data.products);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [statusFilter]);

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { product_id: "", qty: 1, unit_cost: "" }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setForm((f) => {
    const items = [...f.items];
    items[i] = { ...items[i], [field]: val };
    return { ...f, items };
  });

  const totalCost = form.items.reduce((acc, i) => acc + (Number(i.qty) * Number(i.unit_cost || 0)), 0);

  const handleCreate = async () => {
    if (!form.supplier_id) return setError("Select a supplier");
    if (form.items.length === 0) return setError("Add at least one item");
    if (form.items.some((i) => !i.product_id || !i.unit_cost)) return setError("Complete all item fields");

    setSaving(true); setError("");
    try {
      await inventoryAPI.createPurchaseOrder({
        supplier_id:   form.supplier_id,
        expected_date: form.expected_date || null,
        notes:         form.notes,
        items:         form.items.map((i) => ({ product_id: i.product_id, qty: Number(i.qty), unit_cost: Number(i.unit_cost) })),
      });
      setCreateModal(false);
      setForm({ supplier_id: "", expected_date: "", notes: "", items: [] });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const openReceive = (po) => {
    setReceiveModal(po);
    setReceiveData(po.purchase_order_items.map((item) => ({ purchase_order_item_id: item.id, qty_received: item.qty - item.qty_received, product_name: item.products?.name, max: item.qty - item.qty_received })));
  };

  const handleReceive = async () => {
    setSaving(true);
    try {
      await inventoryAPI.receivePurchaseOrder(receiveModal.id, { received_items: receiveData.map((r) => ({ purchase_order_item_id: r.purchase_order_item_id, qty_received: Number(r.qty_received) })) });
      setReceiveModal(null);
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Purchase Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{pos.length} orders</p>
        </div>
        <motion.button onClick={() => { setCreateModal(true); setError(""); }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-black text-sm"
          style={{ background: "#d4af37" }}>
          <FaPlus /> New Purchase Order
        </motion.button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "Draft", "Sent", "Received", "Cancelled"].map((s) => (
          <motion.button key={s} onClick={() => setStatusFilter(s)} whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl text-sm font-medium border transition"
            style={{ background: statusFilter === s ? "#d4af37" : "white", borderColor: statusFilter === s ? "#d4af37" : "#e5e7eb", color: statusFilter === s ? "#000" : "#6b7280" }}>
            {s || "All"}
          </motion.button>
        ))}
      </div>

      {/* PO list */}
      <div className="space-y-4">
        {loading && <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin" /></div>}
        {!loading && pos.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            <FaBoxOpen className="text-5xl mx-auto mb-4 text-gray-200" />
            <p className="font-semibold">No purchase orders</p>
          </div>
        )}
        {pos.map((po, i) => {
          const style = STATUS_STYLES[po.status] || STATUS_STYLES.Draft;
          return (
            <motion.div key={po.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-black text-gray-900">PO #{po.id.slice(-8).toUpperCase()}</p>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: style.bg, color: style.text }}>{po.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{po.suppliers?.name} · {po.suppliers?.contact_name}</p>
                  {po.expected_date && <p className="text-xs text-gray-400 mt-0.5">Expected: {new Date(po.expected_date).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Cost</p>
                    <p className="font-black text-lg" style={{ color: "#d4af37" }}>PKR {Number(po.total_cost).toLocaleString()}</p>
                  </div>
                  {po.status !== "Received" && po.status !== "Cancelled" && (
                    <motion.button onClick={() => openReceive(po)} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-green-200 text-green-700 hover:bg-green-50 transition">
                      <FaCheck /> Receive
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Items */}
              {po.purchase_order_items?.length > 0 && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-3">
                  {po.purchase_order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                      <img src={item.products?.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.products?.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty} · PKR {Number(item.unit_cost).toLocaleString()}</p>
                        {item.qty_received > 0 && <p className="text-xs text-green-600 font-medium">Received: {item.qty_received}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {po.notes && <p className="mt-3 text-xs text-gray-400 italic">{po.notes}</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Create PO Modal */}
      <AnimatePresence>
        {createModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCreateModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="font-black text-xl">New Purchase Order</h2>
                <button onClick={() => setCreateModal(false)}><FaTimes className="text-gray-400" /></button>
              </div>

              <div className="p-6 space-y-5">
                {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Supplier *</label>
                    <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 bg-white">
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Expected Date</label>
                    <input type="date" value={form.expected_date} onChange={(e) => setForm((f) => ({ ...f, expected_date: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Items *</label>
                    <motion.button onClick={addItem} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "#d4af37", color: "#000" }}>
                      <FaPlus className="text-xs" /> Add Item
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {form.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-xl">
                        <div className="col-span-5">
                          <select value={item.product_id} onChange={(e) => updateItem(i, "product_id", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:border-yellow-400 bg-white">
                            <option value="">Product</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input type="number" value={item.qty} min={1} onChange={(e) => updateItem(i, "qty", e.target.value)}
                            placeholder="Qty" className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:border-yellow-400" />
                        </div>
                        <div className="col-span-3">
                          <input type="number" value={item.unit_cost} onChange={(e) => updateItem(i, "unit_cost", e.target.value)}
                            placeholder="PKR cost" className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:border-yellow-400" />
                        </div>
                        <div className="col-span-2 text-right">
                          <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 transition"><FaTimes /></button>
                        </div>
                      </div>
                    ))}
                    {form.items.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No items added yet</p>}
                  </div>

                  {form.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t flex justify-between font-black">
                      <span className="text-gray-600">Total Cost</span>
                      <span style={{ color: "#d4af37" }}>PKR {totalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Notes</label>
                  <textarea value={form.notes} rows={2} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Special instructions..."
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 resize-none" />
                </div>

                <motion.button onClick={handleCreate} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-60"
                  style={{ background: "#d4af37" }}>
                  {saving ? "Creating..." : "Create Purchase Order"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receive Modal */}
      <AnimatePresence>
        {receiveModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReceiveModal(null)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg">Receive Stock</h2>
                <button onClick={() => setReceiveModal(null)}><FaTimes className="text-gray-400" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-5">Confirm quantities received for PO #{receiveModal.id.slice(-8).toUpperCase()}</p>

              <div className="space-y-3 mb-5">
                {receiveData.map((row, i) => (
                  <div key={row.purchase_order_item_id} className="flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl">
                    <p className="text-sm font-semibold text-gray-800 flex-1">{row.product_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Max: {row.max}</span>
                      <input type="number" value={row.qty_received} min={0} max={row.max}
                        onChange={(e) => {
                          const updated = [...receiveData];
                          updated[i] = { ...updated[i], qty_received: Number(e.target.value) };
                          setReceiveData(updated);
                        }}
                        className="w-20 border rounded-lg px-3 py-2 text-sm text-center outline-none focus:border-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>

              <motion.button onClick={handleReceive} disabled={saving} whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-60"
                style={{ background: "#d4af37" }}>
                {saving ? "Processing..." : "Confirm Receipt"}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPurchaseOrders;
