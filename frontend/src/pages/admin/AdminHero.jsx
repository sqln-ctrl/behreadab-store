import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaSave, FaEye, FaUpload, FaTimes } from "react-icons/fa";
import { adminAPI, productsAPI } from "../../services/api";

const POSITIONS = ["left","center","right"];
const HEIGHTS   = ["60vh","75vh","90vh","100vh"];

const Slider = ({ label, value, onChange, min, max, step=1, unit="" }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</label>
      <span className="text-xs font-bold text-gray-700">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-black" />
  </div>
);

const AdminHero = () => {
  const [form, setForm] = useState({
    headline:"", subheadline:"", subtext:"", image_url:"",
    badge_text:"", badge_sub:"", from_price:"", discount_text:"", cta_text:"",
    featured_product_id:"", featured_image_index:0,
    // New controls
    product_size: 280,
    product_position: "right",
    hero_height: "100vh",
    bg_opacity: 20,
    show_bg_media: true,
  });
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([adminAPI.getHeroConfig(), productsAPI.getAll({ limit:100 })]).then(([heroRes, prodRes]) => {
      const d = heroRes.data;
      setForm({
        headline:             d.headline            || "",
        subheadline:          d.subheadline         || "",
        subtext:              d.subtext             || "",
        image_url:            d.image_url           || "",
        badge_text:           d.badge_text          || "",
        badge_sub:            d.badge_sub           || "",
        from_price:           d.from_price          || "",
        discount_text:        d.discount_text       || "",
        cta_text:             d.cta_text            || "",
        featured_product_id:  d.featured_product_id || "",
        featured_image_index: d.featured_image_index || 0,
        product_size:         d.product_size        || 280,
        product_position:     d.product_position    || "right",
        hero_height:          d.hero_height         || "100vh",
        bg_opacity:           d.bg_opacity          ?? 20,
        show_bg_media:        d.show_bg_media       ?? true,
      });
      setPreview(d.image_url || null);
      setProducts(prodRes.data.products || []);
    }).finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const selectedProduct = products.find(p => p.id === form.featured_product_id);
  const productImages   = selectedProduct?.images?.length ? selectedProduct.images : (selectedProduct?.image ? [selectedProduct.image] : []);
  const activeProductImg = productImages[form.featured_image_index] || "";

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await adminAPI.uploadMedia(fd);
      setForm(f => ({ ...f, image_url: data.url })); setPreview(data.url);
    } catch { const url = URL.createObjectURL(file); setPreview(url); setForm(f => ({ ...f, image_url: url })); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateHeroConfig({ ...form, featured_product_id: form.featured_product_id || null, featured_image_index: Number(form.featured_image_index), product_size: Number(form.product_size), bg_opacity: Number(form.bg_opacity) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const isVideo = preview && /\.(mp4|webm|mov)$/i.test(preview);

  const textFields = [
    { key:"headline",      label:"Main Headline",    placeholder:"Andaaz" },
    { key:"subheadline",   label:"Sub Headline",     placeholder:"اندازِ وقت" },
    { key:"cta_text",      label:"Button Text",      placeholder:"Shop Now" },
    { key:"discount_text", label:"Discount Banner",  placeholder:"20% OFF — Eid Sale" },
    { key:"from_price",    label:"Starting Price",   placeholder:"48000" },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily:"'Georgia', serif" }}>Hero Editor</h1>
          <p className="text-gray-400 text-sm mt-1">All changes reflect on the homepage after saving</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer">
            <motion.button whileTap={{ scale:0.97 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium hover:border-black transition">
              <FaEye /> Preview
            </motion.button>
          </a>
          <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 transition"
            style={{ background: saved ? "#22c55e" : "#000", color:"#fff" }}>
            <FaSave /> {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </motion.button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Left: Controls ── */}
        <div className="space-y-5">

          {/* Text content */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-black text-sm uppercase tracking-widest text-gray-400">Text Content</h2>
            {textFields.map(({ key, label, placeholder }) => (
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
          </div>

          {/* Product picker */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-black text-sm uppercase tracking-widest text-gray-400">Featured Product</h2>
            <select value={form.featured_product_id} onChange={set("featured_product_id")}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
              <option value="">None — use background image only</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — PKR {Number(p.price).toLocaleString()}</option>)}
            </select>

            {selectedProduct && productImages.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Choose image:</p>
                <div className="flex gap-2 flex-wrap">
                  {productImages.map((img, i) => (
                    <motion.button key={i} onClick={() => setForm(f => ({ ...f, featured_image_index: i }))} whileTap={{ scale:0.95 }}
                      className="relative rounded-xl overflow-hidden border-2 transition"
                      style={{ borderColor: form.featured_image_index===i ? "#000" : "transparent" }}>
                      <img src={img} alt="" className="w-14 h-14 object-cover" />
                      {form.featured_image_index===i && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="text-white text-xs font-black">✓</span></div>}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct && (
              <>
                <Slider label="Product Image Size" value={form.product_size} onChange={v => setForm(f => ({...f, product_size:v}))} min={150} max={500} unit="px" />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">Product Position</label>
                  <div className="flex gap-2">
                    {POSITIONS.map(pos => (
                      <motion.button key={pos} onClick={() => setForm(f => ({...f, product_position:pos}))} whileTap={{ scale:0.95 }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition"
                        style={{ background: form.product_position===pos ? "#000" : "white", color: form.product_position===pos ? "#fff" : "#6b7280", borderColor: form.product_position===pos ? "#000" : "#e5e7eb" }}>
                        {pos}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Background media */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm uppercase tracking-widest text-gray-400">Background Media</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-gray-500">Show</span>
                <div onClick={() => setForm(f => ({...f, show_bg_media:!f.show_bg_media}))}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.show_bg_media ? "bg-black" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.show_bg_media ? "left-5" : "left-0.5"}`} />
                </div>
              </label>
            </div>

            {form.show_bg_media && (
              <>
                <div className="flex gap-2">
                  <motion.button onClick={() => fileRef.current?.click()} whileTap={{ scale:0.97 }} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:border-black transition disabled:opacity-50">
                    <FaUpload className="text-xs" /> {uploading ? "Uploading..." : "Upload from PC"}
                  </motion.button>
                  <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                </div>
                <input type="text" value={form.image_url} placeholder="Or paste image/video URL..."
                  onChange={e => { setForm(f => ({...f, image_url:e.target.value})); setPreview(e.target.value); }}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
                {preview && (
                  <div className="relative inline-block">
                    {isVideo ? <video src={preview} className="w-32 h-20 rounded-lg object-cover border" muted />
                      : <img src={preview} alt="" className="w-32 h-20 rounded-lg object-cover border" />}
                    <button onClick={() => { setPreview(null); setForm(f => ({...f, image_url:""})); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                      <FaTimes />
                    </button>
                  </div>
                )}
                <Slider label="Background Opacity" value={form.bg_opacity} onChange={v => setForm(f => ({...f, bg_opacity:v}))} min={0} max={80} unit="%" />
              </>
            )}
          </div>

          {/* Layout */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-black text-sm uppercase tracking-widest text-gray-400">Layout</h2>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">Hero Height</label>
              <div className="grid grid-cols-4 gap-2">
                {HEIGHTS.map(h => (
                  <motion.button key={h} onClick={() => setForm(f => ({...f, hero_height:h}))} whileTap={{ scale:0.95 }}
                    className="py-2 rounded-xl text-xs font-bold border transition"
                    style={{ background: form.hero_height===h ? "#000" : "white", color: form.hero_height===h ? "#fff" : "#6b7280", borderColor: form.hero_height===h ? "#000" : "#e5e7eb" }}>
                    {h}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="space-y-3">
          <div className="bg-black rounded-2xl overflow-hidden relative" style={{ minHeight:"320px", height: "400px" }}>
            {/* BG */}
            {form.show_bg_media && preview && (
              isVideo
                ? <video src={preview} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ opacity: form.bg_opacity/100 }} />
                : <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: form.bg_opacity/100 }} />
            )}

            {/* gradient overlay */}
            <div className="absolute inset-0" style={{ background:"linear-gradient(to right, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.3))" }} />

            <div className={`relative z-10 h-full flex items-center p-6 gap-6 ${form.product_position==="right" ? "flex-row" : form.product_position==="left" ? "flex-row-reverse" : "flex-col justify-center text-center"}`}>
              {/* Text */}
              <div className="flex-1 min-w-0">
                {form.discount_text && <span className="inline-block mb-2 text-xs font-bold px-3 py-1 rounded-full border border-white/20 text-white/70">🏷️ {form.discount_text}</span>}
                <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Luxury Timepieces</p>
                <h1 className="text-3xl font-black text-white leading-none" style={{ fontFamily:"'Georgia', serif" }}>{form.headline||"Andaaz"}</h1>
                {form.subheadline && <p className="text-base font-light text-white/40 mt-1" style={{ fontFamily:"'Georgia', serif" }}>{form.subheadline}</p>}
                <p className="text-white/30 text-xs mt-2 line-clamp-2">{form.subtext}</p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <button className="px-4 py-2 rounded-xl font-bold text-black text-xs bg-white">{form.cta_text||"Shop Now"}</button>
                  {form.from_price && <span className="text-white/30 text-xs">From <strong className="text-white/50">PKR {Number(String(form.from_price).replace(/,/g,"")||0).toLocaleString()}</strong></span>}
                </div>
              </div>

              {/* Product image */}
              {selectedProduct && activeProductImg && (
                <div className="flex-shrink-0">
                  <img src={activeProductImg} alt={selectedProduct.name}
                    className="rounded-2xl object-cover"
                    style={{ width: Math.min(form.product_size, 160), height: Math.min(form.product_size, 160), boxShadow:"0 20px 60px rgba(0,0,0,0.8)" }} />
                  <div className="mt-2 text-center">
                    <p className="text-white/50 text-xs">{selectedProduct.category}</p>
                    <p className="text-white text-xs font-black">PKR {Number(selectedProduct.price).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Live preview — scaled down. Save to apply on homepage.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
