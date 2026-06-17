import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaLock } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useAuth from "../hooks/useAuth";
import { ordersAPI, usersAPI } from "../services/api";

const STEPS = ["Address", "Review", "Confirm"];

const EMPTY_ADDR = { full_name: "", phone: "", street: "", city: "", province: "", postal_code: "" };

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [step,            setStep]           = useState(0);
  const [address,         setAddress]        = useState(EMPTY_ADDR);
  const [savedAddresses,  setSavedAddresses] = useState([]);
  const [loadedAddresses, setLoadedAddresses]= useState(false);
  const [paymentMethod,   setPaymentMethod]  = useState("cod");
  const [notes,           setNotes]          = useState("");
  const [placing,         setPlacing]        = useState(false);
  const [orderId,         setOrderId]        = useState(null);
  const [errors,          setErrors]         = useState({});

  // Group cart items
  const grouped = cartItems.reduce((acc, item) => {
    const existing = acc.find((i) => i.id === item.id);
    if (existing) existing.qty += 1;
    else acc.push({ ...item, qty: 1 });
    return acc;
  }, []);

  const itemsTotal   = cartItems.reduce((acc, item) => acc + item.price, 0);
  const shippingCost = itemsTotal >= 5000 ? 0 : 500;
  const total        = itemsTotal + shippingCost;

  // Load saved addresses if logged in
  const loadSavedAddresses = async () => {
    if (!user || loadedAddresses) return;
    setLoadedAddresses(true);
    try {
      const { data } = await usersAPI.getAddresses();
      setSavedAddresses(data);
      const def = data.find((a) => a.is_default) || data[0];
      if (def) setAddress({ full_name: def.full_name, phone: def.phone, street: def.street, city: def.city, province: def.province, postal_code: def.postal_code || "" });
    } catch (err) { console.error(err); }
  };

  const validateAddress = () => {
    const e = {};
    if (!address.full_name) e.full_name = "Required";
    if (!address.phone)     e.phone     = "Required";
    if (!address.street)    e.street    = "Required";
    if (!address.city)      e.city      = "Required";
    if (!address.province)  e.province  = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateAddress()) return;
    setStep((s) => s + 1);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const items = grouped.map((item) => ({ product_id: item.id, qty: item.qty }));
      const { data } = await ordersAPI.create({
        items,
        shippingAddress: address,
        paymentMethod,
        notes,
      });
      setOrderId(data.id);
      setStep(2);
      clearCart?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0 && !orderId) {
    navigate("/cart");
    return null;
  }

  const set = (key) => (e) => {
    setAddress((a) => ({ ...a, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-10 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.jpg" alt="Andaaz" className="h-8 w-8 rounded-full object-cover" style={{ filter: "invert(1)" }} />
            <span className="font-black text-lg" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</span>
          </div>
          <h1 className="text-3xl font-black mt-3">Checkout</h1>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mt-5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${i <= step ? "bg-white text-black" : "bg-white/10 text-white/40"}`}>
                  {i < step ? <FaCheck className="text-xs" /> : i + 1}
                </div>
                <span className={`text-xs uppercase tracking-widest ${i <= step ? "text-white" : "text-white/40"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/20 ml-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* ── Step 0: Address ── */}
          {step === 0 && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-xl mb-5" style={{ fontFamily: "'Georgia', serif" }}>Shipping Address</h2>

                  {/* Saved addresses for logged-in users */}
                  {user && (
                    <div className="mb-5">
                      {!loadedAddresses ? (
                        <motion.button onClick={loadSavedAddresses} whileTap={{ scale: 0.97 }}
                          className="text-sm text-black underline font-medium">
                          Load my saved addresses
                        </motion.button>
                      ) : savedAddresses.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Saved Addresses</p>
                          {savedAddresses.map((a) => (
                            <motion.button key={a.id} whileTap={{ scale: 0.98 }}
                              onClick={() => setAddress({ full_name: a.full_name, phone: a.phone, street: a.street, city: a.city, province: a.province, postal_code: a.postal_code || "" })}
                              className="w-full text-left p-3 rounded-xl border hover:border-black transition text-sm">
                              <span className="font-semibold">{a.full_name}</span> · {a.street}, {a.city}
                              {a.is_default && <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">Default</span>}
                            </motion.button>
                          ))}
                          <div className="border-t my-3" />
                          <p className="text-xs text-gray-400">Or fill in manually below</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Full Name *",  key: "full_name",   col: "col-span-2", placeholder: "Ali Khan" },
                      { label: "Phone *",      key: "phone",       col: "col-span-2", placeholder: "+92-300-1234567" },
                      { label: "Street Address *", key: "street",  col: "col-span-2", placeholder: "House 5, Street 10, DHA Phase 2" },
                      { label: "City *",       key: "city",        col: "",           placeholder: "Lahore" },
                      { label: "Province *",   key: "province",    col: "",           placeholder: "Punjab" },
                      { label: "Postal Code",  key: "postal_code", col: "",           placeholder: "54000" },
                    ].map(({ label, key, col, placeholder }) => (
                      <div key={key} className={col || ""}>
                        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                        <input value={address[key]} onChange={set(key)} placeholder={placeholder}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${errors[key] ? "border-red-400 focus:border-red-400" : "focus:border-black"}`} />
                        {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-xl mb-5" style={{ fontFamily: "'Georgia', serif" }}>Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { value: "cod",      label: "Cash on Delivery",  sub: "Pay when your order arrives" },
                      { value: "jazzcash", label: "JazzCash",          sub: "Mobile wallet payment" },
                      { value: "easypaisa",label: "EasyPaisa",         sub: "Mobile wallet payment" },
                    ].map(({ value, label, sub }) => (
                      <motion.label key={value} whileTap={{ scale: 0.99 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === value ? "border-black bg-gray-50" : "border-gray-200"}`}>
                        <input type="radio" name="payment" value={value} checked={paymentMethod === value}
                          onChange={() => setPaymentMethod(value)} className="w-4 h-4 accent-black" />
                        <div>
                          <p className="font-bold text-sm">{label}</p>
                          <p className="text-xs text-gray-400">{sub}</p>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-lg mb-3" style={{ fontFamily: "'Georgia', serif" }}>Order Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    rows={3} className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition resize-none" />
                </div>
              </div>

              {/* Order summary sidebar */}
              <OrderSidebar grouped={grouped} itemsTotal={itemsTotal} shippingCost={shippingCost} total={total}>
                <motion.button onClick={handleNext} whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-sm uppercase tracking-widest bg-black hover:bg-gray-900 transition">
                  Continue <FaArrowRight className="text-xs" />
                </motion.button>
              </OrderSidebar>
            </motion.div>
          )}

          {/* ── Step 1: Review ── */}
          {step === 1 && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-xl mb-4" style={{ fontFamily: "'Georgia', serif" }}>Shipping To</h2>
                  <p className="font-bold text-gray-800">{address.full_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{address.phone}</p>
                  <p className="text-sm text-gray-500">{address.street}</p>
                  <p className="text-sm text-gray-500">{address.city}, {address.province} {address.postal_code}</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium capitalize">Payment: {paymentMethod.replace("cod", "Cash on Delivery")}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-xl mb-4" style={{ fontFamily: "'Georgia', serif" }}>Items</h2>
                  <div className="space-y-3">
                    {grouped.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                        </div>
                        <p className="font-black text-sm">PKR {Number(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <OrderSidebar grouped={grouped} itemsTotal={itemsTotal} shippingCost={shippingCost} total={total}>
                <div className="space-y-2">
                  <motion.button onClick={handlePlaceOrder} disabled={placing} whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-sm uppercase tracking-widest disabled:opacity-60 bg-black hover:bg-gray-900 transition">
                    <FaLock className="text-xs" />
                    {placing ? "Placing Order..." : "Place Order"}
                  </motion.button>
                  <motion.button onClick={() => setStep(0)} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-sm text-gray-500 border hover:border-gray-400 transition flex items-center justify-center gap-2">
                    <FaArrowLeft className="text-xs" /> Edit Address
                  </motion.button>
                </div>
              </OrderSidebar>
            </motion.div>
          )}

          {/* ── Step 2: Confirmation ── */}
          {step === 2 && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center py-12">
              <motion.div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 300 }}>
                <FaCheck className="text-white text-3xl" />
              </motion.div>
              <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "'Georgia', serif" }}>Order Placed!</h2>
              <p className="text-gray-500 mb-2">Thank you for your order.</p>
              {orderId && <p className="text-sm text-gray-400 font-mono mb-8">Order #{orderId.slice(-8).toUpperCase()}</p>}
              <div className="flex gap-3 justify-center">
                <motion.button onClick={() => navigate("/")} whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:border-black transition">
                  Back to Home
                </motion.button>
                <motion.button onClick={() => navigate(user ? "/profile" : "/")} whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-900 transition">
                  {user ? "View Orders" : "Continue Shopping"}
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

const OrderSidebar = ({ grouped, itemsTotal, shippingCost, total, children }) => (
  <div className="md:col-span-1">
    <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
      <h3 className="font-black text-lg mb-4" style={{ fontFamily: "'Georgia', serif" }}>Order Summary</h3>
      <div className="space-y-3 mb-4">
        {grouped.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">{item.qty}</span>
            </div>
            <p className="text-xs text-gray-700 flex-1 leading-tight">{item.name}</p>
            <p className="text-xs font-bold">PKR {Number(item.price * item.qty).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 space-y-2 text-sm mb-4">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span><span>PKR {Number(itemsTotal).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
            {shippingCost === 0 ? "Free" : `PKR ${shippingCost}`}
          </span>
        </div>
        <div className="flex justify-between font-black text-base pt-1 border-t">
          <span>Total</span><span>PKR {Number(total).toLocaleString()}</span>
        </div>
      </div>
      {children}
    </div>
  </div>
);

export default Checkout;
