import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaBox, FaUsers, FaDollarSign, FaExclamationTriangle } from "react-icons/fa";
import { adminAPI } from "../../services/api";

const STATUS_COLORS = {
  Pending:    { bg: "#fef3c7", text: "#92400e" },
  Processing: { bg: "#dbeafe", text: "#1e40af" },
  Shipped:    { bg: "#ede9fe", text: "#5b21b6" },
  Delivered:  { bg: "#dcfce7", text: "#166534" },
  Cancelled:  { bg: "#fee2e2", text: "#991b1b" },
};

const StatCard = ({ icon, label, value, sub, color = "#000", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
      style={{ background: color + "15", color }}>
      {icon}
    </div>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    <p className="text-sm font-semibold text-gray-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </motion.div>
);

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch((err) => {
        console.error('Dashboard stats error:', err);
        setError(err.response?.data?.message || 'Failed to load stats');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 rounded-full border-2 border-t-black animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
      <p className="font-bold">Failed to load dashboard</p>
      <p className="text-sm mt-1">{error}</p>
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
        <StatCard icon={<FaShoppingBag />} label="Total Orders"  value={stats?.totalOrders   ?? 0} color="#000"    delay={0} />
        <StatCard icon={<FaDollarSign />}  label="Revenue (PKR)" value={`${Number(stats?.totalRevenue ?? 0).toLocaleString()}`} sub="Paid orders" color="#22c55e" delay={0.07} />
        <StatCard icon={<FaBox />}         label="Products"      value={stats?.totalProducts  ?? 0} color="#8b5cf6" delay={0.14} />
        <StatCard icon={<FaUsers />}       label="Customers"     value={stats?.totalUsers     ?? 0} color="#3b82f6" delay={0.21} />
      </div>

      {/* Low stock alert */}
      {stats?.lowStock?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-yellow-500" />
            <p className="font-bold text-yellow-800 text-sm">
              {stats.lowStock.length} product{stats.lowStock.length > 1 ? "s" : ""} low on stock
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStock.map((item) => (
              <span key={item.id} className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                {item.products?.name} ({item.stock_qty} left)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-lg mb-5">Orders by Status</h2>
          {(!stats?.statusCounts || stats.statusCounts.length === 0) ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : stats.statusCounts.map(({ _id, count }) => {
            const style = STATUS_COLORS[_id] || { bg: "#f3f4f6", text: "#374151" };
            return (
              <div key={_id} className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: style.bg, color: style.text }}>
                  {_id}
                </span>
                <span className="font-black text-gray-800">{count}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Recent orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-lg mb-5">Recent Orders</h2>
          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <p className="text-gray-400 text-sm">No recent orders</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order) => {
                const style = STATUS_COLORS[order.status] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{order.users?.name}</p>
                      <p className="text-xs text-gray-400 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-black">PKR {Number(order.total_amount).toLocaleString()}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: style.bg, color: style.text }}>{order.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
