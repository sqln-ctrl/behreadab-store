import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { productsAPI } from "../../services/api";
import api from "../../services/api";

const EMPTY = { name:"", description:"", price:"", cost_price:"", category:"Men", badge:"", stock_qty:"", reorder_point:"5", is_featured:false, warranty_months:"", return_days:"" };
// Categories fetched from DB
const BADGES= ["","Bestseller","New","Top Rated","Limited","Sale"];

const AdminProducts = () => {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showAll,   setShowAll]   = useState(false); // include inactive
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [files,     setFiles]     = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [deleteId,  setDeleteId]  = useState(null);
  const [cats,       setCats]       = useState(["Men","Women","Unisex"]);

  const fetchProducts = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (search) params.search = search;
    // If showAll, we need to fetch inactive too — use admin endpoint
    productsAPI.getAll(params)
      .then(({ data }) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);

  useEffect(() => {
    api.get("/categories").then(({ data }) => { if (data?.length) setCats(data.map(c => c.name)); }).catch(console.error);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFiles([]); setError(""); setModal(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, cost_price: p.cost_price || "", category: p.category, badge: p.badge || "", stock_qty: p.inventory?.stock_qty ?? "", reorder_point: p.inventory?.reorder_point ?? "5", is_featured: p.is_featured, warranty_months: p.warranty_months || "", return_days: p.return_days || "" });
    setFiles([]); setError(""); setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description) return setError("Name, price and description required");
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      ["name","description","price","cost_price","category","badge","stock_qty","reorder_point","is_featured","warranty_months","return_days"].forEach((k) => {
        if (form[k] !== "" && form[k] !== undefined) fd.append(k, form[k]);
      });
      files.forEach((f) => fd.append("images", f));
      if (editing) await productsAPI.update(editing.id, fd);
      else         await productsAPI.create(fd);
      setModal(false); fetchProducts();
    } catch (e) { setError(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (p) => {
    try {
      const fd = new FormData();
      fd.append("is_active", String(!p.is_active));
      await productsAPI.update(p.id, fd);
      // Update locally without re-fetch so product stays visible
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await productsAPI.delete(id); setDeleteId(null); fetchProducts(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily:"'Georgia', serif" }}>Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products</p>
        </div>
        <motion.button onClick={openCreate} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm bg-black">
          <FaPlus /> Add Product
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:border-black transition" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Product","Category","Price","Cost","Stock","Featured","Active","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={8} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin mx-auto" /></td></tr>}
              {!loading && products.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No products</td></tr>}
              {products.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 transition ${!p.is_active ? "opacity-50 bg-gray-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />}
                      <div>
                        <p className="font-semibold text-gray-900 text-xs leading-snug">{p.name}</p>
                        {!p.is_active && <span className="text-xs text-red-400 font-bold">Inactive</span>}
                        {p.badge && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded-full ml-1">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                  <td className="px-4 py-3 font-black text-black text-xs">PKR {Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">PKR {Number(p.cost_price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`font-bold ${(p.inventory?.stock_qty ?? 0) < 5 ? "text-red-500" : "text-gray-700"}`}>{p.inventory?.stock_qty ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3"><span className={`w-2 h-2 rounded-full inline-block ${p.is_featured ? "bg-green-500" : "bg-gray-200"}`} /></td>
                  <td className="px-4 py-3">
                    <motion.button onClick={() => handleToggleActive(p)} whileTap={{ scale:0.9 }} title={p.is_active ? "Click to deactivate" : "Click to activate"}>
                      {p.is_active
                        ? <FaToggleOn className="text-2xl text-green-500" />
                        : <FaToggleOff className="text-2xl text-gray-300" />}
                    </motion.button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <motion.button onClick={() => openEdit(p)} whileTap={{ scale:0.9 }}
                        className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition">
                        <FaEdit className="text-xs" />
                      </motion.button>
                      <motion.button onClick={() => setDeleteId(p.id)} whileTap={{ scale:0.9 }}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                        <FaTrash className="text-xs" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <h2 className="text-lg font-black">{editing ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => setModal(false)}><FaTimes className="text-gray-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
                {[
                  { label:"Product Name *",    key:"name",           type:"text",   placeholder:"Rolex Submariner" },
                  { label:"Sale Price (PKR) *", key:"price",          type:"number", placeholder:"85000" },
                  { label:"Cost Price (PKR)",   key:"cost_price",     type:"number", placeholder:"45000" },
                  { label:"Stock Quantity",     key:"stock_qty",      type:"number", placeholder:"10" },
                  { label:"Reorder Point",      key:"reorder_point",  type:"number", placeholder:"5" },
                  { label:"Warranty (months)",  key:"warranty_months",type:"number", placeholder:"24" },
                  { label:"Return Window (days)",key:"return_days",   type:"number", placeholder:"30" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                    <input type={type} value={form[key]} placeholder={placeholder}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Description *</label>
                  <textarea value={form.description} rows={3} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black resize-none transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Category</label>
                    <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                      {cats.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Badge</label>
                    <select value={form.badge} onChange={(e) => setForm(f => ({ ...f, badge: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                      {BADGES.map(b => <option key={b} value={b}>{b || "None"}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="feat" checked={form.is_featured}
                    onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="feat" className="text-sm font-medium text-gray-700">Show on homepage (Featured)</label>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Images / Videos</label>
                  <input type="file" multiple accept="image/*,video/*"
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 transition" />
                  {files.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="w-12 h-12 rounded-lg object-cover border" />)}
                    </div>
                  )}
                  {editing?.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {editing.images.map((img, i) => <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border opacity-60" />)}
                    </div>
                  )}
                </div>
                <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale:0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Product"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-80 text-center shadow-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash className="text-red-500 text-xl" /></div>
              <h3 className="font-black text-lg mb-2">Delete Product?</h3>
              <p className="text-gray-400 text-sm mb-6">Product will be deactivated and hidden.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
