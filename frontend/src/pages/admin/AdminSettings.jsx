import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSave, FaCheck } from "react-icons/fa";
import { settingsAPI } from "../../services/api";

const Field = ({ label, value, onChange, type = "number", unit, help }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
    {help && <p className="text-xs text-gray-400 mb-2">{help}</p>}
    <div className="flex items-center gap-3">
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition font-bold" />
      {unit && <span className="text-sm font-semibold text-gray-500 flex-shrink-0">{unit}</span>}
    </div>
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    delivery_charge: 500, free_delivery_threshold: 5000,
    return_days: 30, warranty_months: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    settingsAPI.get().then(({ data }) => { setSettings(data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update({
        delivery_charge:           Number(settings.delivery_charge),
        free_delivery_threshold:   Number(settings.free_delivery_threshold),
        return_days:               Number(settings.return_days),
        warranty_months:           Number(settings.warranty_months),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Store Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Delivery charges, warranty, return policy</p>
        </div>
        <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 transition"
          style={{ background: saved ? "#22c55e" : "#000", color: "#fff" }}>
          {saved ? <><FaCheck /> Saved!</> : <><FaSave /> {saving ? "Saving..." : "Save"}</>}
        </motion.button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Delivery</h2>
        <Field label="Delivery Charge" value={settings.delivery_charge} onChange={set("delivery_charge")} unit="PKR" help="Charged when order is below the free threshold" />
        <Field label="Free Delivery Threshold" value={settings.free_delivery_threshold} onChange={set("free_delivery_threshold")} unit="PKR" help="Orders above this amount get free delivery" />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mt-4">Returns & Warranty (shown on every product)</h2>
        <Field label="Return Window" value={settings.return_days} onChange={set("return_days")} unit="days" help="How many days customers have to return a product" />
        <Field label="Warranty Period" value={settings.warranty_months} onChange={set("warranty_months")} unit="months" help="Warranty duration shown on all product pages" />
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-500">
        <p className="font-semibold text-gray-700 mb-2">Current policy shown to customers:</p>
        <ul className="space-y-1">
          <li>🚚 Free delivery on orders above PKR {Number(settings.free_delivery_threshold).toLocaleString()}</li>
          <li>📦 PKR {Number(settings.delivery_charge).toLocaleString()} delivery fee otherwise</li>
          <li>↩️ {settings.return_days}-day returns</li>
          <li>🛡️ {settings.warranty_months >= 12 ? `${Math.round(settings.warranty_months / 12)}-year` : `${settings.warranty_months}-month`} warranty</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
