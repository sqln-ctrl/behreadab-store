import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { authAPI } from "../services/api";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [name, setName]       = useState(user?.name || "");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const { data } = await authAPI.updateProfile({ name });
      updateUser(data); setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setError(e.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12 px-5 md:px-8">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-xl font-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily:"'Georgia', serif" }}>{user?.name}</h1>
            <p className="text-white/40 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-8 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-lg mb-5">Edit Profile</h2>
          {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Email</label>
              <input value={user?.email} disabled className="w-full border rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400" />
            </div>
            <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale:0.97 }}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60"
              style={{ background: saved ? "#22c55e" : "#000" }}>
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </motion.button>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/orders" className="flex-1">
            <motion.button whileTap={{ scale:0.97 }} className="w-full py-3 rounded-xl border font-medium text-sm hover:border-black transition">View My Orders</motion.button>
          </Link>
          <motion.button onClick={logout} whileTap={{ scale:0.97 }} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition">
            <FaSignOutAlt className="text-xs" /> Sign Out
          </motion.button>
        </div>
      </div>
    </div>
  );
};
export default Profile;
