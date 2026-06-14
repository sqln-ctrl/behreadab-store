import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaBox, FaUsers, FaDollarSign, FaClock, FaCheckCircle, FaTruck, FaTimes } from "react-icons/fa";
import { adminAPI } from "../../services/api";

const STATUS_COLORS = {
  Pending:    { bg: "#fef3c7", text: "#92400e", icon: <FaClock /> },
  Processing: { bg: "#dbeafe", text: "#1e40af", icon: <FaBox /> },
  Shipped:    { bg: "#ede9fe", text: "#5b21b6", icon: <FaTruck /> },
  Delivered:  { bg: "#dcfce7", text: "#166534", icon: <FaCheckCircle /> },
  Cancelled:  { bg: "#fee2e2", text: "#991b1b", icon: <FaTimes /> },
};

const StatCard = ({ icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-2xl p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
        style={{ background: color + "20", color }}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    <p className="text-sm font-semibold text-gray-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 rounded-full border-2 border-t-yellow-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaShoppingBag />} label="Total Orders" value={stats?.totalOrders ?? 0} color="#d4af37" delay={0} />
        <StatCard icon={<FaDollarSign />} label="Revenue" value={`$${stats?.totalRevenue ?? 0}`} sub="Paid orders only" color="#22c55e" delay={0.07} />
        <StatCard icon={<FaBox />} label="Products" value={stats?.totalProducts ?? 0} color="#8b5cf6" delay={0.14} />
        <StatCard icon={<FaUsers />} label="Customers" value={stats?.totalUsers ?? 0} color="#3b82f6" delay={0.21} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order status breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-lg mb-5">Orders by Status</h2>
          <div className="space-y-3">
            {stats?.statusCounts?.length === 0 && <p className="text-gray-400 text-sm">No orders yet</p>}
            {stats?.statusCounts?.map(({ _id, count }) => {
              const style = STATUS_COLORS[_id] || { bg: "#f3f4f6", text: "#374151" };
              return (
                <div key={_id} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full"
                    style={{ background: style.bg, color: style.text }}>
                    {style.icon} {_id}
                  </span>
                  <span className="font-black text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-lg mb-5">Top Products</h2>
          <div className="space-y-3">
            {stats?.topProducts?.length === 0 && <p className="text-gray-400 text-sm">No sales yet</p>}
            {stats?.topProducts?.map(({ _id, totalSold, revenue }, i) => (
              <div key={_id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                  style={{ background: "#d4af37" }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{_id}</p>
                  <p className="text-xs text-gray-400">{totalSold} sold · ${revenue} revenue</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent orders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="font-black text-lg">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentOrders?.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No recent orders</td></tr>
              )}
              {stats?.recentOrders?.map((order) => {
                const style = STATUS_COLORS[order.status] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{order.user?.name}</td>
                    <td className="px-6 py-4 font-black" style={{ color: "#d4af37" }}>${order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: style.bg, color: style.text }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
