import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTrash, FaPrint, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";

const STATUSES = ["Pending","Processing","Shipped","Delivered","Cancelled"];
const STATUS_STYLES = {
  Pending:    { bg: "#fef3c7", text: "#92400e" },
  Processing: { bg: "#dbeafe", text: "#1e40af" },
  Shipped:    { bg: "#ede9fe", text: "#5b21b6" },
  Delivered:  { bg: "#dcfce7", text: "#166534" },
  Cancelled:  { bg: "#fee2e2", text: "#991b1b" },
};

const AdminOrders = () => {
  const [orders,         setOrders]        = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [statusFilter,   setStatusFilter]  = useState("");
  const [selectedOrder,  setSelectedOrder] = useState(null);
  const [newStatus,      setNewStatus]     = useState("");
  const [trackingNumber, setTracking]      = useState("");
  const [updating,       setUpdating]      = useState(false);
  const [deleteId,       setDeleteId]      = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    adminAPI.getAllOrders({ status: statusFilter, limit: 50 })
      .then(({ data }) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTracking(order.tracking_number || "");
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(selectedOrder.id, { status: newStatus, tracking_number: trackingNumber });
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteOrder(deleteId);
      setDeleteId(null);
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", ...STATUSES].map((s) => (
          <motion.button key={s} onClick={() => setStatusFilter(s)} whileTap={{ scale: 0.97 }}
            className="px-3 py-2 rounded-xl text-xs font-semibold border transition"
            style={{ background: statusFilter === s ? "#000" : "white", color: statusFilter === s ? "#fff" : "#6b7280", borderColor: statusFilter === s ? "#000" : "#e5e7eb" }}>
            {s || "All"}
          </motion.button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID","Customer","Items","Total","Payment","Status","Date","Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={8} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin mx-auto" /></td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>}
              {orders.map((order) => {
                const style = STATUS_STYLES[order.status] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{order.users?.name}</p>
                      <p className="text-xs text-gray-400">{order.users?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{order.order_items?.length} item(s)</td>
                    <td className="px-4 py-3 font-black text-xs" style={{ color: "#000" }}>PKR {Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.is_paid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                        {order.is_paid ? "Paid" : order.payment_method?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: style.bg, color: style.text }}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <motion.button onClick={() => openOrder(order)} whileTap={{ scale: 0.9 }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:border-black transition">
                          Manage
                        </motion.button>
                        <Link to={`/admin/orders/${order.id}/receipt`}>
                          <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-black hover:text-white transition">
                            <FaPrint className="text-xs" />
                          </motion.button>
                        </Link>
                        <motion.button onClick={() => setDeleteId(order.id)} whileTap={{ scale: 0.9 }}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                          <FaTrash className="text-xs" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage order modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <h2 className="font-black text-lg">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
                <div className="flex items-center gap-3">
                  <Link to={`/admin/orders/${selectedOrder.id}/receipt`} target="_blank">
                    <button className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1"><FaPrint className="text-xs" /> Print</button>
                  </Link>
                  <button onClick={() => setSelectedOrder(null)}><FaTimes className="text-gray-400" /></button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Customer</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.users?.name}</p>
                  <p className="text-xs text-gray-400">{selectedOrder.users?.email}</p>
                </div>
                {selectedOrder.shipping_address && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Ship To</p>
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-0.5">
                      <p className="font-bold">{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.phone}</p>
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-xs">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.qty} · PKR {Number(item.price).toLocaleString()}</p>
                        </div>
                        <p className="font-black text-xs">PKR {Number(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t flex justify-between font-black text-sm">
                    <span>Total</span>
                    <span>PKR {Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Update Status</p>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white mb-3">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <input value={trackingNumber} onChange={(e) => setTracking(e.target.value)}
                    placeholder="Tracking number (optional)"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black mb-3" />
                  <motion.button onClick={handleUpdateStatus} disabled={updating} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60">
                    {updating ? "Updating..." : "Update Order"}
                  </motion.button>
                </div>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-80 text-center shadow-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <h3 className="font-black text-lg mb-2">Delete Order?</h3>
              <p className="text-gray-400 text-sm mb-6">This will hide the order from your records.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-gray-600">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
