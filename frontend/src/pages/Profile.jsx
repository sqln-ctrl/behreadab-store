import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaHeart, FaBox, FaSignOutAlt, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import { authAPI } from "../services/api";

const tabs = [
  { id: "profile", label: "Profile", icon: <FaUser /> },
  { id: "orders", label: "My Orders", icon: <FaBox /> },
  { id: "addresses", label: "Addresses", icon: <FaMapMarkerAlt /> },
  { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editForm, setEditForm] = useState({ name: user?.name || "", email: user?.email || "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSaveProfile = async () => {
    setSaveError(""); setSaveMsg("");
    if (editForm.password && editForm.password !== editForm.confirm) {
      return setSaveError("Passwords do not match");
    }
    setSaving(true);
    try {
      const payload = { name: editForm.name, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      const { data } = await authAPI.updateProfile(payload);
      updateUser(data);
      setSaveMsg("Profile updated!");
      setEditForm((f) => ({ ...f, password: "", confirm: "" }));
    } catch (err) {
      setSaveError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-black text-2xl font-black flex-shrink-0"
            style={{ background: "#d4af37" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#d4af37" }}>My Account</p>
            <h1 className="text-2xl md:text-3xl font-black" style={{ fontFamily: "'Georgia', serif" }}>{user?.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    background: activeTab === tab.id ? "#d4af37" : "transparent",
                    color: activeTab === tab.id ? "#000" : "#6b7280",
                  }}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}

              <div className="border-t mt-2 pt-2">
                <motion.button
                  onClick={logout}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all text-left"
                >
                  <FaSignOutAlt /> Sign Out
                </motion.button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >

                {/* ── Profile Tab ── */}
                {activeTab === "profile" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Georgia', serif" }}>Edit Profile</h2>

                    {saveMsg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5">
                        {saveMsg}
                      </motion.div>
                    )}
                    {saveError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
                        {saveError}
                      </motion.div>
                    )}

                    <div className="space-y-5">
                      {[
                        { label: "Full Name", key: "name", type: "text", icon: <FaUser /> },
                        { label: "Email Address", key: "email", type: "email", icon: <FaEnvelope /> },
                        { label: "New Password", key: "password", type: "password", icon: <FaLock />, placeholder: "Leave blank to keep current" },
                        { label: "Confirm Password", key: "confirm", type: "password", icon: <FaLock />, placeholder: "Repeat new password" },
                      ].map(({ label, key, type, icon, placeholder }) => (
                        <div key={key}>
                          <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">{label}</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                            <input
                              type={type}
                              value={editForm[key]}
                              onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                              placeholder={placeholder || ""}
                              className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-yellow-400 transition text-gray-800 placeholder-gray-300"
                            />
                          </div>
                        </div>
                      ))}

                      <motion.button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-3 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-60"
                        style={{ background: "#d4af37" }}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* ── Orders Tab ── */}
                {activeTab === "orders" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Georgia', serif" }}>My Orders</h2>
                    <div className="text-center py-16 text-gray-400">
                      <FaBox className="text-5xl mx-auto mb-4 text-gray-200" />
                      <p className="font-semibold">No orders yet</p>
                      <p className="text-sm mt-1">Your orders will appear here after checkout</p>
                    </div>
                  </div>
                )}

                {/* ── Addresses Tab ── */}
                {activeTab === "addresses" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>Saved Addresses</h2>
                      <motion.button whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-black"
                        style={{ background: "#d4af37" }}>
                        <FaPlus className="text-xs" /> Add Address
                      </motion.button>
                    </div>
                    <div className="text-center py-16 text-gray-400">
                      <FaMapMarkerAlt className="text-5xl mx-auto mb-4 text-gray-200" />
                      <p className="font-semibold">No saved addresses</p>
                      <p className="text-sm mt-1">Add an address to speed up checkout</p>
                    </div>
                  </div>
                )}

                {/* ── Wishlist Tab ── */}
                {activeTab === "wishlist" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Georgia', serif" }}>My Wishlist</h2>
                    <div className="text-center py-16 text-gray-400">
                      <FaHeart className="text-5xl mx-auto mb-4 text-gray-200" />
                      <p className="font-semibold">Your wishlist is empty</p>
                      <p className="text-sm mt-1">Heart items on the shop to save them here</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
