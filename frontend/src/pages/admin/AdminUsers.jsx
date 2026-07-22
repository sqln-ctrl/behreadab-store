import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaToggleOn, FaToggleOff, FaSearch } from "react-icons/fa";
import { adminAPI } from "../../services/api";

const AdminUsers = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getAllUsers({ search, limit: 50 }).then(({ data }) => setUsers(data.users || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggle = async (user, field, value) => {
    try { await adminAPI.updateUser(user.id, { [field]: value }); fetchUsers(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily:"'Georgia', serif" }}>Users</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} users</p>
      </div>
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:border-black transition" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {["Name","Email","Role","Active","Joined","Actions"].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={6} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin mx-auto" /></td></tr>}
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">{user.name?.[0]?.toUpperCase()}</div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-5 py-4">
                    <select value={user.role} onChange={e => toggle(user, "role", e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 outline-none bg-white">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <motion.button onClick={() => toggle(user, "is_active", !user.is_active)} whileTap={{ scale:0.9 }}>
                      {user.is_active ? <FaToggleOn className="text-2xl text-green-500" /> : <FaToggleOff className="text-2xl text-gray-300" />}
                    </motion.button>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role==="admin"?"bg-black text-white":"bg-gray-100 text-gray-600"}`}>{user.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminUsers;
