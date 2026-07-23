import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaUpload, FaStar, FaGripVertical } from "react-icons/fa";
import api, { adminAPI } from "../../services/api";

const EMPTY = { name:"", image_url:"", is_featured:false, sort_order:0 };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [preview,    setPreview]    = useState(null);
  const [imageFile,  setImageFile]  = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [deleteId,   setDeleteId]   = useState(null);
  const fileRef = useRef(null);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories').then(({ data }) => setCategories(data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setPreview(null); setImageFile(null); setError(""); setModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, image_url: cat.image_url || "", is_featured: cat.is_featured, sort_order: cat.sort_order });
    setPreview(cat.image_url || null);
    setImageFile(null); setError(""); setModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Category name required");
    setSaving(true); setError("");
    try {
      let imageUrl = form.image_url;

      // Upload image if file selected
      if (imageFile) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          const { data } = await adminAPI.uploadMedia(fd);
          imageUrl = data.url;
        } catch {
          // If Cloudinary not set up, use object URL (local only)
          imageUrl = preview || "";
        } finally { setUploading(false); }
      }

      const payload = { ...form, image_url: imageUrl, sort_order: Number(form.sort_order) };

      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }

      setModal(false); fetchCategories();
    } catch (e) { setError(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/categories/${deleteId}`); setDeleteId(null); fetchCategories(); }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  const handleToggleFeatured = async (cat) => {
    try {
      await api.put(`/categories/${cat.id}`, { is_featured: !cat.is_featured });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_featured: !c.is_featured } : c));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily:"'Georgia', serif" }}>Categories</h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} categories · Featured ones show on homepage</p>
        </div>
        <motion.button onClick={openCreate} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm bg-black">
          <FaPlus /> Add Category
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin"/></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition ${cat.is_featured ? "border-yellow-300" : "border-transparent"}`}>

              {/* Image */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">⌚</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="absolute bottom-3 left-4">
                  <h3 className="text-white font-black text-xl" style={{ fontFamily:"'Georgia', serif" }}>{cat.name}</h3>
                  {cat.is_featured && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">Featured on Homepage</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaGripVertical className="text-gray-300"/>
                  <span>Order: {cat.sort_order}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Feature toggle */}
                  <motion.button onClick={() => handleToggleFeatured(cat)} whileTap={{ scale:0.9 }}
                    title={cat.is_featured ? "Remove from homepage" : "Show on homepage"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${cat.is_featured ? "bg-yellow-100 text-yellow-500" : "bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-400"}`}>
                    <FaStar className="text-xs"/>
                  </motion.button>
                  <motion.button onClick={() => openEdit(cat)} whileTap={{ scale:0.9 }}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition">
                    <FaEdit className="text-xs"/>
                  </motion.button>
                  <motion.button onClick={() => setDeleteId(cat.id)} whileTap={{ scale:0.9 }}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                    <FaTrash className="text-xs"/>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
              <p className="text-4xl mb-3">🏷️</p>
              <p className="font-semibold">No categories yet</p>
              <p className="text-sm mt-1">Add Men, Women, Unisex to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"/>
            <motion.div initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <h2 className="font-black text-lg">{editing ? "Edit Category" : "Add Category"}</h2>
                <button onClick={() => setModal(false)}><FaTimes className="text-gray-400"/></button>
              </div>

              <div className="p-5 space-y-4">
                {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Category Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    placeholder="e.g. Men, Women, Kids, Luxury"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition"/>
                </div>

                {/* Image */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Category Image</label>

                  {preview ? (
                    <div className="relative mb-3">
                      <img src={preview} alt="" className="w-full h-40 object-cover rounded-xl"/>
                      <button onClick={() => { setPreview(null); setImageFile(null); setForm(f => ({...f, image_url:""})); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                        <FaTimes/>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-3 cursor-pointer hover:border-black transition"
                      onClick={() => fileRef.current?.click()}>
                      <FaUpload className="text-gray-300 text-2xl mx-auto mb-2"/>
                      <p className="text-sm text-gray-400">Click to upload image</p>
                      <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP</p>
                    </div>
                  )}

                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>

                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400">Or paste URL:</span>
                    <input value={form.image_url} onChange={e => { setForm(f => ({...f, image_url:e.target.value})); setPreview(e.target.value); }}
                      placeholder="https://..."
                      className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:border-black transition"/>
                  </div>
                </div>

                {/* Sort order */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Display Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({...f, sort_order:e.target.value}))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition"
                    placeholder="1 = first, 2 = second..."/>
                  <p className="text-xs text-gray-400 mt-1">Lower number appears first</p>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
                  <input type="checkbox" id="featured" checked={form.is_featured}
                    onChange={e => setForm(f => ({...f, is_featured:e.target.checked}))} className="w-4 h-4 accent-black"/>
                  <div>
                    <label htmlFor="featured" className="text-sm font-bold text-yellow-800 cursor-pointer">Show on Homepage</label>
                    <p className="text-xs text-yellow-600">Featured categories appear in the "Shop by Category" section</p>
                  </div>
                </div>

                <motion.button onClick={handleSave} disabled={saving || uploading} whileTap={{ scale:0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60">
                  {uploading ? "Uploading image..." : saving ? "Saving..." : editing ? "Save Changes" : "Create Category"}
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
              onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/50 z-50"/>
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-80 text-center shadow-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-500 text-xl"/>
              </div>
              <h3 className="font-black text-lg mb-2">Delete Category?</h3>
              <p className="text-gray-400 text-sm mb-6">Products in this category won't be deleted but will have no category assigned.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
