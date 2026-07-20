import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaSave, FaEye, FaUpload, FaTimes } from "react-icons/fa";
import { adminAPI, productsAPI } from "../../services/api";

const AdminHero = () => {
  const [form, setForm] = useState({ headline:"", subheadline:"", subtext:"", image_url:"", badge_text:"", badge_sub:"", from_price:"", discount_text:"", cta_text:"", featured_product_id:"", featured_image_index:0 });
  const [products,    setProducts]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [saving,      setSaving]     = useState(false);
  const [saved,       setSaved]      = useState(false);
  const [uploading,   setUploading]  = useState(false);
  const [preview,     setPreview]    = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      adminAPI.getHeroConfig(),
      productsAPI.getAll({ limit: 100 }),
    ]).then(([heroRes, prodRes]) => {
      const d = heroRes.data;
      setForm({ headline: d.headline||"", subheadline: d.subheadline||"", subtext: d.subtext||"", image_url: d.image_url||"", badge_text: d.badge_text||"", badge_sub: d.badge_sub||"", from_price: d.from_price||"", discount_text: d.discount_text||"", cta_text: d.cta_text||"", featured_product_id: d.featured_product_id||"", featured_image_index: d.featured_image_index||0 });
      setPreview(d.image_url || null);
      setProducts(prodRes.data.products || []);
    }).finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const selectedProduct = products.find(p => p.id === form.featured_product_id);
  const productImages   = selectedProduct?.images || (selectedProduct?.image ? [selectedProduct.image] : []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await adminAPI.uploadMedia(fd);
      setForm(f => ({ ...f, image_url: data.url }));
      setPreview(data.url);
    } catch (err) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, featured_product_id: form.featured_product_id || null, featured_image_index: Number(form.featured_image_index) };
      await adminAPI.updateHeroConfig(payload);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily:"'Georgia', serif" }}>Hero Editor</h1>
          <p className="text-gray-400 text-sm mt-1">Changes reflect on the homepage immediately after saving</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer">
            <motion.button whileTap={{ scale:0.97 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium hover:border-black transition">
              <FaEye /> Preview
            </motion.button>
          </a>
          <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 transition"
            style={{ background: saved ? "#22c55e" : "#000", color: "#fff" }}>
            <FaSave /> {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </motion.button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-black text-lg">Content</h2>

          {/* Product picker */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Featured Product (optional)</p>
            <select value={form.featured_product_id} onChange={set("featured_product_id")}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
              <option value="">No product selected (use image URL below)</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — PKR {Number(p.price).toLocaleString()}</option>)}
            </select>

            {selectedProduct && productImages.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Choose which image to show:</p>
                <div className="flex gap-2 flex-wrap">
                  {productImages.map((img, i) => (
                    <motion.button key={i} onClick={() => setForm(f => ({ ...f, featured_image_index: i }))} whileTap={{ scale:0.95 }}
                      className="relative rounded-lg overflow-hidden border-2 transition"
                      style={{ borderColor: form.featured_image_index === i ? "#000" : "transparent" }}>
                      <img src={img} alt="" className="w-14 h-14 object-cover" />
                      {form.featured_image_index === i && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct && (
              <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                <img src={productImages[form.featured_image_index] || selectedProduct.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-sm">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-400">PKR {Number(selectedProduct.price).toLocaleString()} · {selectedProduct.category}</p>
                  <p className="text-xs text-gray-400">Clicking the watch image on homepage will go to this product</p>
                </div>
              </div>
            )}
          </div>

          {[
            { key:"headline",      label:"Main Headline",   placeholder:"Andaaz" },
            { key:"subheadline",   label:"Sub Headline",    placeholder:"اندازِ وقت" },
            { key:"cta_text",      label:"Button Text",     placeholder:"Shop Now" },
            { key:"discount_text", label:"Discount Banner", placeholder:"20% OFF — Eid Sale" },
            { key:"from_price",    label:"Starting Price",  placeholder:"48000" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
              <input type="text" value={form[key]} onChange={set(key)} placeholder={placeholder}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Description</label>
            <textarea value={form.subtext} onChange={set("subtext")} rows={2}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black resize-none transition" />
          </div>

          {/* Background Image/Video (fallback if no product selected) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">
              Background Image / Video {form.featured_product_id ? "(not shown when product is selected)" : ""}
            </label>
            <div className="flex gap-2 mb-2">
              <motion.button onClick={() => fileRef.current?.click()} whileTap={{ scale:0.97 }} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:border-black transition disabled:opacity-50">
                <FaUpload className="text-xs" /> {uploading ? "Uploading..." : "Upload from PC"}
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </div>
            <input type="text" value={form.image_url} onChange={(e) => { set("image_url")(e); setPreview(e.target.value); }}
              placeholder="Or paste image/video URL..."
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
            {preview && (
              <div className="mt-2 relative inline-block">
                {/\.(mp4|webm)$/i.test(preview) ? <video src={preview} className="w-32 h-20 rounded-lg object-cover border" muted />
                  : <img src={preview} alt="" className="w-32 h-20 rounded-lg object-cover border" />}
                <button onClick={() => { setPreview(null); setForm(f => ({ ...f, image_url: "" })); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div className="bg-black rounded-2xl overflow-hidden" style={{ minHeight: "380px" }}>
            <div className="relative p-8 flex flex-col justify-center" style={{ minHeight: "380px" }}>
              {preview && <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
              <div className="relative z-10">
                {form.discount_text && <span className="inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full border border-white/20 text-white/70">🏷️ {form.discount_text}</span>}
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Luxury Timepieces</p>
                <h1 className="text-4xl font-black text-white leading-none" style={{ fontFamily:"'Georgia', serif" }}>{form.headline || "Andaaz"}</h1>
                {form.subheadline && <p className="text-lg font-light text-white/40 mt-1" style={{ fontFamily:"'Georgia', serif" }}>{form.subheadline}</p>}
                <p className="text-white/40 text-xs mt-3 max-w-xs">{form.subtext}</p>
                <div className="mt-5 flex items-center gap-3">
                  <button className="px-5 py-2.5 rounded-xl font-bold text-black text-sm bg-white">{form.cta_text || "Shop Now"}</button>
                  {form.from_price && <span className="text-white/40 text-xs">From <strong className="text-white/60">PKR {Number(String(form.from_price).replace(/,/g,"") || 0).toLocaleString()}</strong></span>}
                </div>
                {selectedProduct && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-xl p-2">
                    <img src={productImages[form.featured_image_index] || selectedProduct.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-white text-xs font-bold">{selectedProduct.name}</p>
                      <p className="text-white/40 text-xs">PKR {Number(selectedProduct.price).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Live preview — Save to apply</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
