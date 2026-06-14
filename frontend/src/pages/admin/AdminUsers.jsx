import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaUserShield, FaBan, FaCheck } from "react-icons/fa";
import { adminAPI } from "../../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getAllUsers({ search, limit: 50 })
      .then(({ data }) => setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleActive = async (user) => {
    setUpdating(user._id);
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const toggleRole = async (user) => {
    setUpdating(user._id);
    try {
      await adminAPI.updateUser(user._id, { role: user.role === "admin" ? "user" : "admin" });
      fetchUsers();
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Users</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="relative max-w-sm">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:border-yellow-400 transition" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={5} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-yellow-400 animate-spin mx-auto" /></td></tr>}
              {!loading && users.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>}
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-black text-sm flex-shrink-0"
                        style={{ background: user.role === "admin" ? "#d4af37" : "#e5e7eb" }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {user.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button onClick={() => toggleRole(user)} disabled={updating === user._id}
                        whileTap={{ scale: 0.9 }} title={user.role === "admin" ? "Remove admin" : "Make admin"}
                        className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center hover:bg-yellow-100 transition disabled:opacity-50">
                        <FaUserShield className="text-xs" />
                      </motion.button>
                      <motion.button onClick={() => toggleActive(user)} disabled={updating === user._id}
                        whileTap={{ scale: 0.9 }} title={user.isActive ? "Ban user" : "Unban user"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${user.isActive ? "bg-red-50 text-red-400 hover:bg-red-100" : "bg-green-50 text-green-500 hover:bg-green-100"}`}>
                        {user.isActive ? <FaBan className="text-xs" /> : <FaCheck className="text-xs" />}
                      </motion.button>
                    </div>
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
