import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBox } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ordersAPI } from "../services/api";

const STATUS_COLORS = { Pending:{ bg:"#fef3c7",text:"#92400e" }, Processing:{ bg:"#dbeafe",text:"#1e40af" }, Shipped:{ bg:"#ede9fe",text:"#5b21b6" }, Delivered:{ bg:"#dcfce7",text:"#166534" }, Cancelled:{ bg:"#fee2e2",text:"#991b1b" } };

const OrderHistory = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMyOrders().then(({ data }) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs mb-2 text-white/40">Account</p>
          <h1 className="text-4xl font-black" style={{ fontFamily:"'Georgia', serif" }}>My Orders</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 space-y-4">
        {loading && <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin" /></div>}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-gray-400">
            <FaBox className="text-5xl mx-auto mb-4 text-gray-200" />
            <p className="font-semibold">No orders yet</p>
            <Link to="/shop" className="mt-3 inline-block text-sm text-black underline">Start shopping</Link>
          </div>
        )}
        {orders.map((order, i) => {
          const style = STATUS_COLORS[order.status] || { bg:"#f3f4f6", text:"#374151" };
          return (
            <motion.div key={order.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString("en-PK",{ year:"numeric",month:"long",day:"numeric" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold" style={{ background:style.bg, color:style.text }}>{order.status}</span>
                  <span className="font-black text-black">PKR {Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default OrderHistory;
