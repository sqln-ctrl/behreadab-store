import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPrint, FaArrowLeft, FaCheckCircle, FaClock, FaTruck, FaTimesCircle } from "react-icons/fa";
import api from "../../services/api";

const STATUS_ICONS = {
  Pending:    <FaClock className="text-yellow-500" />,
  Processing: <FaClock className="text-blue-500" />,
  Shipped:    <FaTruck className="text-purple-500" />,
  Delivered:  <FaCheckCircle className="text-green-500" />,
  Cancelled:  <FaTimesCircle className="text-red-500" />,
};

const OrderReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-t-yellow-400 animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Order not found</div>
  );

  const addr      = order.shipping_address || {};
  const printDate = new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });
  const orderDate = new Date(order.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print bg-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b">
        <motion.button onClick={() => navigate(-1)} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition">
          <FaArrowLeft className="text-xs" /> Back to Orders
        </motion.button>
        <motion.button onClick={() => window.print()} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black text-sm"
          style={{ background: "#d4af37" }}>
          <FaPrint /> Print Receipt
        </motion.button>
      </div>

      {/* Receipt */}
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-black text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
                  Watch<span style={{ color: "#d4af37" }}>Store</span>
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">Order Dispatch Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Order #</p>
                <p className="font-black text-lg tracking-wider" style={{ color: "#d4af37" }}>
                  {order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">

            {/* Status + dates */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                {STATUS_ICONS[order.status]}
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-bold text-sm">{order.status}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Order Date</p>
                <p className="font-bold text-sm">{orderDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Print Date</p>
                <p className="font-bold text-sm">{printDate}</p>
              </div>
              {order.tracking_number && (
                <div>
                  <p className="text-xs text-gray-400">Tracking #</p>
                  <p className="font-bold text-sm font-mono">{order.tracking_number}</p>
                </div>
              )}
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                <p className="font-bold text-gray-900">{order.users?.name || addr.full_name}</p>
                <p className="text-sm text-gray-500">{order.users?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ship To</p>
                <p className="font-bold text-gray-900">{addr.full_name}</p>
                <p className="text-sm text-gray-600">{addr.phone}</p>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.province}</p>
                {addr.postal_code && <p className="text-sm text-gray-600">{addr.postal_code}</p>}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover no-print" />
                            <p className="font-semibold text-gray-800">{item.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{item.qty}</td>
                        <td className="px-4 py-3 text-right text-gray-600">PKR {Number(item.price).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold">PKR {Number(item.price * item.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>PKR {Number(order.items_total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={order.shipping_cost === 0 ? "text-green-600 font-medium" : ""}>
                  {order.shipping_cost === 0 ? "Free" : `PKR ${Number(order.shipping_cost).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t">
                <span>Total</span>
                <span style={{ color: "#d4af37" }}>PKR {Number(order.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="font-semibold">{order.payment_method?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-bold ${order.is_paid ? "text-green-600" : "text-orange-500"}`}>
                  {order.is_paid ? "✓ PAID" : "PENDING — Collect on Delivery"}
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-700 mb-1">Customer Notes</p>
                <p className="text-sm text-yellow-800">{order.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-gray-400">
              <p className="font-semibold text-gray-600 mb-1">Thank you for your order!</p>
              <p>WatchStore · watchstore.pk · support@watchstore.pk</p>
              <p className="mt-1">Official order dispatch receipt</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderReceipt;
