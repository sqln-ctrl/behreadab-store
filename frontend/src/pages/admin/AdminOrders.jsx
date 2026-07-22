import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTrash, FaPrint, FaCheck, FaPlus, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { adminAPI, productsAPI } from "../../services/api";
import api from "../../services/api";

const STATUSES = ["Pending","Processing","Shipped","Delivered","Cancelled"];
const STATUS_STYLES = {
  Pending:           { bg:"#fef3c7", text:"#92400e" },
  Processing:        { bg:"#dbeafe", text:"#1e40af" },
  Shipped:           { bg:"#ede9fe", text:"#5b21b6" },
  Delivered:         { bg:"#dcfce7", text:"#166534" },
  Cancelled:         { bg:"#fee2e2", text:"#991b1b" },
  "Confirm Delivered":{ bg:"#d1fae5", text:"#065f46" },
  "Confirm Cancelled":{ bg:"#fecaca", text:"#7f1d1d" },
};

// Which next statuses are allowed from current
const NEXT_STATUSES = {
  Pending:    ["Processing","Shipped","Delivered","Confirm Delivered","Cancelled","Confirm Cancelled"],
  Processing: ["Shipped","Delivered","Confirm Delivered","Cancelled","Confirm Cancelled"],
  Shipped:    ["Delivered","Confirm Delivered","Cancelled","Confirm Cancelled"],
  Delivered:  ["Confirm Delivered","Confirm Cancelled"],
  Cancelled:  ["Confirm Cancelled"],
};

const AdminOrders = () => {
  const [orders,         setOrders]        = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [statusFilter,   setStatusFilter]  = useState("");
  const [selectedOrder,  setSelectedOrder] = useState(null);
  const [newStatus,      setNewStatus]     = useState("");
  const [tracking,       setTracking]      = useState("");
  const [updating,       setUpdating]      = useState(false);
  const [deleteId,       setDeleteId]      = useState(null);
  const [manualModal,    setManualModal]   = useState(false);
  const [products,       setProducts]      = useState([]);
  const [manualForm,     setManualForm]    = useState({
    customer_name:"", customer_phone:"", source:"whatsapp",
    city:"", province:"", street:"",
    notes:"", items:[{ product_id:"", qty:1, price:"" }],
  });
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError,  setManualError]  = useState("");

  const fetchOrders = () => {
    setLoading(true);
    adminAPI.getAllOrders({ status: statusFilter, limit:50 })
      .then(({ data }) => setOrders(data.orders||[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);
  useEffect(() => {
    productsAPI.getAll({ limit:100 }).then(({ data }) => setProducts(data.products||[])).catch(console.error);
  }, []);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTracking(order.tracking_number||"");
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(selectedOrder.id, { status: newStatus, tracking_number: tracking });
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) { alert(e.response?.data?.message || "Update failed"); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteOrder(deleteId);
      setDeleteId(null); fetchOrders();
    } catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  const addManualItem = () => setManualForm(f => ({ ...f, items:[...f.items,{ product_id:"", qty:1, price:"" }] }));
  const removeManualItem = (i) => setManualForm(f => ({ ...f, items: f.items.filter((_,idx)=>idx!==i) }));
  const updateManualItem = (i, key, val) => setManualForm(f => {
    const items = [...f.items]; items[i]={...items[i],[key]:val}; return {...f, items};
  });

  const handleManualOrder = async () => {
    if (!manualForm.customer_name||!manualForm.customer_phone) return setManualError("Name and phone required");
    if (manualForm.items.some(i=>!i.product_id||!i.qty)) return setManualError("Complete all items");
    setManualSaving(true); setManualError("");
    try {
      await api.post('/orders/manual', {
        customer_name:    manualForm.customer_name,
        customer_phone:   manualForm.customer_phone,
        customer_address: { street: manualForm.street, city: manualForm.city, province: manualForm.province },
        items:            manualForm.items.map(i=>({ product_id:i.product_id, qty:Number(i.qty), price: i.price ? Number(i.price):undefined })),
        source:           manualForm.source,
        notes:            manualForm.notes,
      });
      setManualModal(false);
      setManualForm({ customer_name:"", customer_phone:"", source:"whatsapp", city:"", province:"", street:"", notes:"", items:[{ product_id:"", qty:1, price:"" }] });
      fetchOrders();
    } catch (e) { setManualError(e.response?.data?.message||"Failed"); }
    finally { setManualSaving(false); }
  };

  const totalManualCost = manualForm.items.reduce((acc,i)=>{
    const prod = products.find(p=>p.id===i.product_id);
    return acc + (i.price ? Number(i.price) : (prod?.price||0)) * Number(i.qty||0);
  },0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily:"'Georgia', serif" }}>Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} orders</p>
        </div>
        <motion.button onClick={()=>{ setManualModal(true); setManualError(""); }} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm bg-black">
          <FaPlus /> Add Manual Order
        </motion.button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {["",...STATUSES].map(s=>(
          <motion.button key={s} onClick={()=>setStatusFilter(s)} whileTap={{ scale:0.97 }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition"
            style={{ background:statusFilter===s?"#000":"white", color:statusFilter===s?"#fff":"#6b7280", borderColor:statusFilter===s?"#000":"#e5e7eb" }}>
            {s||"All"}
          </motion.button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Order","Customer","Items","Total","Source","Status","Date","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={8} className="text-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-black animate-spin mx-auto"/></td></tr>}
              {!loading && orders.length===0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>}
              {orders.map(order=>{
                const style = STATUS_STYLES[order.status]||{ bg:"#f3f4f6", text:"#374151" };
                const customerName = order.users?.name || order.guest_email?.split("@")[0] || "Guest";
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                      {order.is_confirmed && <span className="text-xs text-green-600 font-bold">✓ Confirmed</span>}
                      {order.is_manual && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Manual</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{customerName}</p>
                      <p className="text-xs text-gray-400">{order.users?.email||order.guest_email||""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{order.order_items?.length} item(s)</td>
                    <td className="px-4 py-3 font-black text-xs">PKR {Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {order.source==="whatsapp" ? <FaWhatsapp className="text-green-500 text-lg" title="WhatsApp" />
                        : order.source==="instagram" ? <FaInstagram className="text-pink-500 text-lg" title="Instagram" />
                        : <span className="text-xs text-gray-400">Web</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ background:style.bg, color:style.text }}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <motion.button onClick={()=>openOrder(order)} whileTap={{ scale:0.9 }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:border-black transition">
                          Manage
                        </motion.button>
                        <Link to={`/admin/orders/${order.id}/receipt`}>
                          <motion.button whileTap={{ scale:0.9 }} className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-black hover:text-white transition">
                            <FaPrint className="text-xs"/>
                          </motion.button>
                        </Link>
                        <motion.button onClick={()=>setDeleteId(order.id)} whileTap={{ scale:0.9 }}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                          <FaTrash className="text-xs"/>
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
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={()=>setSelectedOrder(null)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"/>
            <motion.div initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="font-black text-lg">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
                  {selectedOrder.is_manual && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">Manual Order</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/admin/orders/${selectedOrder.id}/receipt`} target="_blank">
                    <button className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1"><FaPrint className="text-xs"/> Print</button>
                  </Link>
                  <button onClick={()=>setSelectedOrder(null)}><FaTimes className="text-gray-400"/></button>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Customer info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                  <p className="font-semibold">{selectedOrder.users?.name || "Guest"}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.users?.email || selectedOrder.guest_email}</p>
                  {selectedOrder.shipping_address && (
                    <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                      <p className="font-bold">{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.phone}</p>
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {selectedOrder.order_items?.map(item=>(
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover"/>
                      <div className="flex-1"><p className="font-semibold text-xs">{item.name}</p><p className="text-xs text-gray-400">Qty:{item.qty} · PKR {Number(item.price).toLocaleString()}</p></div>
                      <p className="font-black text-xs">PKR {Number(item.price*item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="flex justify-between font-black text-sm pt-2 border-t">
                    <span>Total</span><span>PKR {Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Status update with confirmation flow */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Update Status</p>

                  {/* Confirmation note */}
                  <div className="bg-blue-50 rounded-xl p-3 mb-3 text-xs text-blue-700">
                    <p className="font-bold mb-1">📋 Verification Flow</p>
                    <p>Set to <strong>Delivered</strong> after you ship. Then set to <strong>Confirm Delivered</strong> only after the customer confirms receipt — this finalises the revenue.</p>
                    <p className="mt-1">Set to <strong>Cancelled</strong> first, then <strong>Confirm Cancelled</strong> to restore stock with no revenue impact.</p>
                  </div>

                  <select value={newStatus} onChange={e=>setNewStatus(e.target.value)}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white mb-3">
                    <option value={selectedOrder.status}>{selectedOrder.status} (current)</option>
                    {(NEXT_STATUSES[selectedOrder.status]||STATUSES).map(s=>(
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <input value={tracking} onChange={e=>setTracking(e.target.value)}
                    placeholder="Tracking number (optional)"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black mb-3"/>

                  <motion.button onClick={handleUpdate} disabled={updating||newStatus===selectedOrder.status} whileTap={{ scale:0.97 }}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-40">
                    {updating ? "Updating..." : newStatus==="Confirm Delivered" ? "✓ Confirm Delivery & Add to Revenue" : newStatus==="Confirm Cancelled" ? "✗ Confirm Cancellation & Restore Stock" : "Update Order"}
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
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={()=>setDeleteId(null)} className="fixed inset-0 bg-black/50 z-50"/>
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-80 text-center shadow-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash className="text-red-500 text-xl"/></div>
              <h3 className="font-black text-lg mb-2">Delete Order?</h3>
              <p className="text-gray-400 text-sm mb-2">This will permanently hide the order from your records.</p>
              <p className="text-amber-600 text-xs mb-6 bg-amber-50 px-3 py-2 rounded-lg">Note: Can only delete orders that are Confirmed Delivered or Confirmed Cancelled.</p>
              <div className="flex gap-3">
                <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Order Modal */}
      <AnimatePresence>
        {manualModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={()=>setManualModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"/>
            <motion.div initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="font-black text-lg">Add Manual Order</h2>
                  <p className="text-xs text-gray-400">For WhatsApp / Instagram customers</p>
                </div>
                <button onClick={()=>setManualModal(false)}><FaTimes className="text-gray-400"/></button>
              </div>
              <div className="p-5 space-y-4">
                {manualError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{manualError}</p>}

                {/* Source */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Order Source</label>
                  <div className="flex gap-2">
                    {["whatsapp","instagram","manual"].map(s=>(
                      <motion.button key={s} onClick={()=>setManualForm(f=>({...f,source:s}))} whileTap={{ scale:0.95 }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold capitalize transition"
                        style={{ background:manualForm.source===s?"#000":"white", color:manualForm.source===s?"#fff":"#6b7280", borderColor:manualForm.source===s?"#000":"#e5e7eb" }}>
                        {s==="whatsapp"&&<FaWhatsapp className="text-green-500"/>}
                        {s==="instagram"&&<FaInstagram className="text-pink-500"/>}
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                {[
                  { label:"Customer Name *",  key:"customer_name",  placeholder:"Ali Khan" },
                  { label:"Phone *",          key:"customer_phone", placeholder:"+92-300-1234567" },
                  { label:"City",             key:"city",           placeholder:"Lahore" },
                  { label:"Province",         key:"province",       placeholder:"Punjab" },
                  { label:"Street",           key:"street",         placeholder:"House 5, Street 10" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                    <input value={manualForm[key]} onChange={e=>setManualForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition"/>
                  </div>
                ))}

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Items *</label>
                    <motion.button onClick={addManualItem} whileTap={{ scale:0.95 }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black text-white flex items-center gap-1">
                      <FaPlus className="text-xs"/> Add Item
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {manualForm.items.map((item,i)=>(
                      <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-xl">
                        <div className="col-span-5">
                          <select value={item.product_id} onChange={e=>updateManualItem(i,"product_id",e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:border-black bg-white">
                            <option value="">Select product</option>
                            {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input type="number" value={item.qty} min={1} onChange={e=>updateManualItem(i,"qty",e.target.value)}
                            placeholder="Qty" className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:border-black"/>
                        </div>
                        <div className="col-span-3">
                          <input type="number" value={item.price} onChange={e=>updateManualItem(i,"price",e.target.value)}
                            placeholder={products.find(p=>p.id===item.product_id)?.price ? `PKR ${products.find(p=>p.id===item.product_id).price}` : "Custom price"}
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:border-black"/>
                        </div>
                        <div className="col-span-2 text-right">
                          {manualForm.items.length > 1 && (
                            <button onClick={()=>removeManualItem(i)} className="text-red-400 hover:text-red-600 transition"><FaTimes/></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalManualCost > 0 && (
                    <div className="mt-2 pt-2 border-t flex justify-between font-black text-sm">
                      <span className="text-gray-500">Estimated Total</span>
                      <span>PKR {Number(totalManualCost).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Notes</label>
                  <textarea value={manualForm.notes} onChange={e=>setManualForm(f=>({...f,notes:e.target.value}))} rows={2}
                    placeholder="Any special instructions..."
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black resize-none"/>
                </div>

                <motion.button onClick={handleManualOrder} disabled={manualSaving} whileTap={{ scale:0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60">
                  {manualSaving ? "Creating..." : "Create Manual Order"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
