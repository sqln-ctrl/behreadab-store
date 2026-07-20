import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaShoppingBag, FaBox, FaUsers, FaDollarSign, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { adminAPI } from "../../services/api";

const StatCard = ({ icon, label, value, sub, color = "#000", delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl p-5 shadow-sm">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: color + "18", color }}>
      {icon}
    </div>
    <p className="text-2xl font-black text-gray-900">{value ?? 0}</p>
    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wider">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </motion.div>
);

const STATUS_COLORS = {
  Pending:    { bg: "#fef3c7", text: "#92400e" },
  Processing: { bg: "#dbeafe", text: "#1e40af" },
  Shipped:    { bg: "#ede9fe", text: "#5b21b6" },
  Delivered:  { bg: "#dcfce7", text: "#166534" },
  Cancelled:  { bg: "#fee2e2", text: "#991b1b" },
};

const Dashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch((e) => setError(e.response?.data?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-10 h-10 rounded-full border-2 border-t-black animate-spin" /></div>;
  if (error)   return <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600"><p className="font-bold">Error</p><p className="text-sm mt-1">{error}</p></div>;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Store overview at a glance</p>
      </div>

      {/* Order summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FaShoppingBag />}  label="Total Orders"     value={stats?.totalOrders}     color="#000"    delay={0} />
        <StatCard icon={<FaCheckCircle />}  label="Delivered"        value={stats?.deliveredOrders} color="#22c55e" delay={0.06} sub="Confirmed" />
        <StatCard icon={<FaClock />}        label="Pending"          value={stats?.pendingOrders}   color="#f59e0b" delay={0.12} sub="In progress" />
        <StatCard icon={<FaTimesCircle />}  label="Cancelled"        value={stats?.cancelledOrders} color="#ef4444" delay={0.18} />
      </div>

      {/* Revenue + products + users */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<FaDollarSign />} label="Total Revenue (PKR)" value={`${Number(stats?.totalRevenue ?? 0).toLocaleString()}`} color="#22c55e" delay={0.24} sub="Delivered orders only" />
        <StatCard icon={<FaBox />}        label="Active Products"     value={stats?.totalProducts} color="#8b5cf6" delay={0.3} />
        <StatCard icon={<FaUsers />}      label="Customers"           value={stats?.totalUsers}    color="#3b82f6" delay={0.36} />
      </div>

      {/* Low stock */}
      {stats?.lowStock?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-yellow-500" />
            <p className="font-bold text-yellow-800 text-sm">{stats.lowStock.length} product{stats.lowStock.length > 1 ? "s" : ""} low on stock</p>
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
        {/* Status breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-lg mb-5">Orders by Status</h2>
          {!stats?.statusCounts?.length ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : stats.statusCounts.map(({ _id, count }) => {
            const style = STATUS_COLORS[_id] || { bg: "#f3f4f6", text: "#374151" };
            const total = stats.totalOrders || 1;
            return (
              <div key={_id} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: style.text }}>{_id}</span>
                  <span className="text-xs font-black text-gray-700">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: style.text }}
                    initial={{ width: 0 }} animate={{ width: `${(count / total) * 100}%` }} transition={{ delay: 0.5, duration: 0.6 }} />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Recent orders */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gray-400 hover:text-black underline">View all</Link>
          </div>
          {!stats?.recentOrders?.length ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 6).map((order) => {
                const style = STATUS_COLORS[order.status] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{order.users?.name}</p>
                      <p className="text-xs text-gray-400 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-black">PKR {Number(order.total_amount).toLocaleString()}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: style.bg, color: style.text }}>{order.status}</span>
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
