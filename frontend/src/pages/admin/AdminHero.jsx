import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaSave, FaEye, FaUpload, FaTimes } from "react-icons/fa";
import { adminAPI } from "../../services/api";
import api from "../../services/api";

const AdminHero = () => {
  const [form, setForm] = useState({
    headline: "", subheadline: "", subtext: "", image_url: "",
    badge_text: "", badge_sub: "", from_price: "", discount_text: "", cta_text: "",
  });
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadPrev, setUploadPrev] = useState(null);
  const fileRef = useRef(null);

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
      setUploadPrev(data.image_url || null);
    }).finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Upload image/video to Cloudinary via backend
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("images", file);
      fd.append("folder", "watchstore/hero");

      // Use product upload endpoint (already wired to Cloudinary)
      const { data } = await api.post("/admin/upload-hero-media", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = data.url;
      setForm((f) => ({ ...f, image_url: url }));
      setUploadPrev(url);
    } catch (err) {
      console.error("Upload failed:", err);
      // Fallback: just use object URL for preview, user can also paste URL
      const objectUrl = URL.createObjectURL(file);
      setUploadPrev(objectUrl);
      alert("Direct upload failed. Please paste the image URL manually or set up Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateHeroConfig(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const isVideo = form.image_url && /\.(mp4|webm|mov|ogg)$/i.test(form.image_url);

  const fields = [
    { key: "headline",      label: "Main Headline",    placeholder: "Andaaz" },
    { key: "subheadline",   label: "Sub Headline",     placeholder: "اندازِ وقت" },
    { key: "subtext",       label: "Description",      placeholder: "Premium watches crafted..." },
    { key: "cta_text",      label: "Button Text",      placeholder: "Shop Now" },
    { key: "discount_text", label: "Discount Banner",  placeholder: "20% OFF — Eid Sale" },
    { key: "from_price",    label: "Starting Price",   placeholder: "48000" },
    { key: "badge_text",    label: "Image Badge",      placeholder: "New Arrival" },
    { key: "badge_sub",     label: "Badge Subtitle",   placeholder: "Swiss Collection 2025" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Hero Editor</h1>
          <p className="text-gray-400 text-sm mt-1">Changes reflect instantly on the homepage</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer">
            <motion.button whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:border-gray-400 transition">
              <FaEye /> Preview
            </motion.button>
          </a>
          <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 transition"
            style={{ background: saved ? "#22c55e" : "#000", color: "#fff" }}>
            <FaSave /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-black text-lg mb-2">Content</h2>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>
          ) : (
            <>
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                  {key === "subtext" ? (
                    <textarea value={form[key]} onChange={set(key)} placeholder={placeholder} rows={3}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition resize-none" />
                  ) : (
                    <input type="text" value={form[key]} onChange={set(key)} placeholder={placeholder}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
                  )}
                </div>
              ))}

              {/* Image/Video upload */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">
                  Hero Image / Video
                </label>

                {/* Upload from PC */}
                <div className="flex gap-2 mb-2">
                  <motion.button onClick={() => fileRef.current?.click()} whileTap={{ scale: 0.97 }}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:border-black transition disabled:opacity-50">
                    <FaUpload className="text-xs" />
                    {uploading ? "Uploading..." : "Upload from PC"}
                  </motion.button>
                  <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                </div>

                {/* Or paste URL */}
                <input type="text" value={form.image_url} onChange={set("image_url")}
                  placeholder="Or paste image/video URL..."
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />

                {/* Preview thumbnail */}
                {uploadPrev && (
                  <div className="mt-2 relative inline-block">
                    {/\.(mp4|webm|mov)$/i.test(uploadPrev) ? (
                      <video src={uploadPrev} className="w-32 h-20 rounded-lg object-cover border" muted />
                    ) : (
                      <img src={uploadPrev} alt="" className="w-32 h-20 rounded-lg object-cover border" />
                    )}
                    <button onClick={() => { setUploadPrev(null); setForm((f) => ({ ...f, image_url: "" })); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP, MP4, WebM</p>
              </div>
            </>
          )}
        </div>

        {/* Live preview */}
        <div className="space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden shadow-sm" style={{ minHeight: "420px" }}>
            <div className="relative p-8 flex flex-col justify-center" style={{ minHeight: "420px" }}>
              {uploadPrev && (
                isVideo ? (
                  <video src={uploadPrev} autoPlay loop muted playsInline
                    className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
                ) : (
                  <img src={uploadPrev} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
                )
              )}
              <div className="relative z-10">
                {form.discount_text && (
                  <span className="inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full border border-white/20 text-white/80 uppercase tracking-widest">
                    🏷️ {form.discount_text}
                  </span>
                )}
                <p className="text-xs uppercase tracking-widest mb-2 text-white/40">Luxury Timepieces</p>
                <h1 className="text-4xl font-black text-white leading-none" style={{ fontFamily: "'Georgia', serif" }}>
                  {form.headline || "Andaaz"}
                </h1>
                {form.subheadline && (
                  <h2 className="text-xl font-light text-white/50 mt-1" style={{ fontFamily: "'Georgia', serif" }}>
                    {form.subheadline}
                  </h2>
                )}
                <p className="text-white/40 text-sm mt-3 max-w-xs">{form.subtext}</p>
                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <button className="px-5 py-2.5 rounded-xl font-bold text-black text-sm bg-white">
                    {form.cta_text || "Shop Now"}
                  </button>
                  {form.from_price && (
                    <span className="text-white text-sm">
                      From <strong>PKR {Number(form.from_price.replace(/,/g, "") || 0).toLocaleString()}</strong>
                    </span>
                  )}
                </div>
                {form.badge_text && (
                  <div className="mt-5 inline-block bg-white text-black px-3 py-2 rounded-xl">
                    <p className="text-xs text-gray-500">{form.badge_text}</p>
                    <p className="text-xs font-black">{form.badge_sub}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Live preview — click Save to apply</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
