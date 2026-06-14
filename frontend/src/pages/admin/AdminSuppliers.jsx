import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { inventoryAPI } from "../../services/api";

const EMPTY = { name: "", contact_name: "", email: "", phone: "", address: "", notes: "" };

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    inventoryAPI.getSuppliers().then(({ data }) => setSuppliers(data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, contact_name: s.contact_name, email: s.email, phone: s.phone, address: s.address, notes: s.notes }); setError(""); setModal(true); };

  const handleSave = async () => {
    if (!form.name) return setError("Supplier name required");
    setSaving(true); setError("");
    try {
      if (editing) await inventoryAPI.updateSupplier(editing.id, form);
      else await inventoryAPI.createSupplier(form);
      setModal(false); fetch();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await inventoryAPI.deleteSupplier(id);
    setDeleteId(null); fetch();
  };

  const fields = [
    { key: "name",         label: "Company Name *",  type: "text",  placeholder: "Swiss Time Imports" },
    { key: "contact_name", label: "Contact Person",   type: "text",  placeholder: "Ahmad Raza" },
    { key: "email",        label: "Email",            type: "email", placeholder: "supplier@example.com" },
    { key: "phone",        label: "Phone",            type: "text",  placeholder: "+92-300-1234567" },
    { key: "address",      label: "Address",          type: "text",  placeholder: "City, Country" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Suppliers</h1>
          <p className="text-gray-400 text-sm mt-1">{suppliers.length} active suppliers</p>
        </div>
        <motion.button onClick={openCreate} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-black text-sm"
          style={{ background: "#d4af37" }}>
          <FaPlus /> Add Supplier
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-black text-lg flex-shrink-0"
                  style={{ background: "#d4af37" }}>
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <motion.button onClick={() => openEdit(s)} whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition">
                    <FaEdit className="text-xs" />
                  </motion.button>
                  <motion.button onClick={() => setDeleteId(s.id)} whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                    <FaTrash className="text-xs" />
                  </motion.button>
                </div>
              </div>

              <h3 className="font-black text-gray-900">{s.name}</h3>
              {s.contact_name && <p className="text-sm text-gray-500 mt-0.5">{s.contact_name}</p>}

              <div className="mt-4 space-y-2">
                {s.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaEnvelope className="text-gray-400 flex-shrink-0" /> {s.email}
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaPhone className="text-gray-400 flex-shrink-0" /> {s.phone}
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" /> {s.address}
                  </div>
                )}
              </div>

              {s.notes && (
                <p className="mt-3 text-xs text-gray-400 bg-gray-50 p-2.5 rounded-lg leading-relaxed">{s.notes}</p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-700">{s.purchase_orders?.length || 0}</span> purchase orders
                </p>
              </div>
            </motion.div>
          ))}

          {suppliers.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <FaTimes className="text-5xl mx-auto mb-4 text-gray-200" />
              <p className="font-semibold">No suppliers yet</p>
              <p className="text-sm mt-1">Add your first supplier to start creating purchase orders</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-xl">{editing ? "Edit Supplier" : "Add Supplier"}</h2>
                <button onClick={() => setModal(false)}><FaTimes className="text-gray-400" /></button>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}

              <div className="space-y-4">
                {fields.map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                    <input type={type} value={form[key]} placeholder={placeholder}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 transition" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Notes</label>
                  <textarea value={form.notes} rows={3} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Payment terms, lead times, etc."
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-400 transition resize-none" />
                </div>
                <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-60"
                  style={{ background: "#d4af37" }}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Supplier"}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-80 text-center shadow-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <h3 className="font-black text-lg mb-2">Remove Supplier?</h3>
              <p className="text-gray-400 text-sm mb-6">This will deactivate the supplier. Existing purchase orders remain.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-600">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Remove</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSuppliers;
