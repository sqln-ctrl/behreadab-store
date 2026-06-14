import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimes } from "react-icons/fa";
import { ordersAPI } from "../services/api";

const STATUS_STYLES = {
  Pending:    { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock /> },
  Processing: { color: "#3b82f6", bg: "#dbeafe", icon: <FaBox /> },
  Shipped:    { color: "#8b5cf6", bg: "#ede9fe", icon: <FaTruck /> },
  Delivered:  { color: "#22c55e", bg: "#dcfce7", icon: <FaCheckCircle /> },
  Cancelled:  { color: "#ef4444", bg: "#fee2e2", icon: <FaTimes /> },
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ordersAPI.getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-t-yellow-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-xs mb-2" style={{ color: "#d4af37" }}>Account</p>
          <h1 className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif" }}>My Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
        {error && <p className="text-red-500 text-center py-8">{error}</p>}

        {orders.length === 0 && !error ? (
          <div className="text-center py-20">
            <FaBox className="text-6xl text-gray-200 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
            <Link to="/shop">
              <motion.button whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-black"
                style={{ background: "#d4af37" }}>
                Shop Now
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">Order</p>
                      <p className="font-bold text-gray-800 text-sm font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: status.bg, color: status.color }}>
                        {status.icon} {order.status}
                      </span>
                      <span className="text-lg font-black" style={{ color: "#d4af37" }}>${order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-3 flex-wrap">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.qty} · ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.trackingNumber && (
                    <p className="mt-3 text-xs text-gray-400">
                      Tracking: <span className="font-mono font-semibold text-gray-700">{order.trackingNumber}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
