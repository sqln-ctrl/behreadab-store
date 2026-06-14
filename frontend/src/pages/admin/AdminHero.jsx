import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSave, FaEye } from "react-icons/fa";
import { adminAPI } from "../../services/api";

const AdminHero = () => {
  const [form, setForm] = useState({
    headline: "", subheadline: "", subtext: "", image_url: "",
    badge_text: "", badge_sub: "", from_price: "", discount_text: "", cta_text: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminAPI.getHeroConfig().then(({ data }) => {
      setForm({
        headline:      data.headline      || "",
        subheadline:   data.subheadline   || "",
        subtext:       data.subtext       || "",
        image_url:     data.image_url     || "",
        badge_text:    data.badge_text    || "",
        badge_sub:     data.badge_sub     || "",
        from_price:    data.from_price    || "",
        discount_text: data.discount_text || "",
        cta_text:      data.cta_text      || "",
      });
    }).finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateHeroConfig(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const fields = [
    { key: "headline",      label: "Main Headline",     placeholder: "Timeless" },
    { key: "subheadline",   label: "Sub Headline",      placeholder: "Elegance." },
    { key: "subtext",       label: "Description Text",  placeholder: "Premium watches crafted for style..." },
    { key: "cta_text",      label: "Button Text",       placeholder: "Shop Now" },
    { key: "discount_text", label: "Discount Banner",   placeholder: "20% OFF — Eid Sale" },
    { key: "from_price",    label: "Starting Price",    placeholder: "199" },
    { key: "badge_text",    label: "Image Badge",       placeholder: "New Arrival" },
    { key: "badge_sub",     label: "Badge Subtitle",    placeholder: "Swiss Collection 2025" },
    { key: "image_url",     label: "Watch Image URL",   placeholder: "https://images.unsplash.com/..." },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Hero Editor</h1>
          <p className="text-gray-400 text-sm mt-1">Edit the homepage banner in real time</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer">
            <motion.button whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:border-gray-400 transition">
              <FaEye /> Preview
            </motion.button>
          </a>
          <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black text-sm disabled:opacity-60"
            style={{ background: saved ? "#22c55e" : "#d4af37", color: saved ? "#fff" : "#000" }}>
            <FaSave /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-black text-lg mb-2">Content</h2>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin" /></div>
          ) : fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
              {key === "subtext" ? (
                <textarea value={form[key]} onChange={set(key)} placeholder={placeholder} rows={3}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 transition resize-none" />
              ) : (
                <input type="text" value={form[key]} onChange={set(key)} placeholder={placeholder}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 transition" />
              )}
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden shadow-sm" style={{ minHeight: "420px" }}>
            <div className="relative p-8 flex flex-col justify-center" style={{ minHeight: "420px" }}>
              {/* bg image */}
              {form.image_url && (
                <img src={form.image_url} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
              )}
              <div className="relative z-10">
                {form.discount_text && (
                  <span className="inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#ef4444", color: "#fff" }}>
                    {form.discount_text}
                  </span>
                )}
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#d4af37" }}>Luxury Timepieces</p>
                <h1 className="text-4xl font-black text-white leading-none" style={{ fontFamily: "'Georgia', serif" }}>
                  {form.headline || "Timeless"}
                </h1>
                <h1 className="text-4xl font-black leading-none" style={{ fontFamily: "'Georgia', serif", color: "#d4af37" }}>
                  {form.subheadline || "Elegance."}
                </h1>
                <p className="text-gray-400 text-sm mt-3 max-w-xs">{form.subtext}</p>
                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <button className="px-5 py-2.5 rounded-lg font-bold text-black text-sm"
                    style={{ background: "#d4af37" }}>
                    {form.cta_text || "Shop Now"}
                  </button>
                  {form.from_price && (
                    <span className="text-white text-sm">From <strong style={{ color: "#d4af37" }}>PKR {Number(form.from_price).toLocaleString()}</strong></span>
                  )}
                </div>
                <div className="mt-6 flex gap-2 flex-wrap">
                  {form.badge_text && (
                    <div className="bg-white text-black px-3 py-2 rounded-xl shadow-lg">
                      <p className="text-xs text-gray-500">{form.badge_text}</p>
                      <p className="text-xs font-black">{form.badge_sub}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Live preview — save to apply to the actual homepage</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
