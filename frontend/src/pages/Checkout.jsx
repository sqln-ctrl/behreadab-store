import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaLock } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useAuth from "../hooks/useAuth";
import useSettings from "../hooks/useSettings";
import { ordersAPI, usersAPI } from "../services/api";

const EMPTY = { full_name:"", phone:"", street:"", city:"", province:"", postal_code:"" };

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user }    = useAuth();
  const { settings } = useSettings();
  const navigate    = useNavigate();

  const [step,      setStep]    = useState(0);
  const [address,   setAddress] = useState(EMPTY);
  const [savedAddrs,setSaved]   = useState([]);
  const [payment,   setPayment] = useState("cod");
  const [notes,     setNotes]   = useState("");
  const [placing,   setPlacing] = useState(false);
  const [orderId,   setOrderId] = useState(null);
  const [errors,    setErrors]  = useState({});

  const grouped = cartItems.reduce((acc, item) => { const ex = acc.find(i => i.id === item.id); if (ex) ex.qty += 1; else acc.push({ ...item, qty: 1 }); return acc; }, []);
  const subtotal     = cartItems.reduce((a, i) => a + i.price, 0);
  const shippingCost = subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const total        = subtotal + shippingCost;

  useEffect(() => {
    if (user) {
      usersAPI.getAddresses().then(({ data }) => {
        setSaved(data);
        const def = data.find(a => a.is_default) || data[0];
        if (def) setAddress({ full_name: def.full_name, phone: def.phone, street: def.street, city: def.city, province: def.province, postal_code: def.postal_code || "" });
      }).catch(() => {});
    }
  }, [user]);

  const validate = () => {
    const e = {};
    if (!address.full_name) e.full_name = "Required";
    if (!address.phone)     e.phone     = "Required";
    if (!address.street)    e.street    = "Required";
    if (!address.city)      e.city      = "Required";
    if (!address.province)  e.province  = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (step === 0 && !validate()) return; setStep(s => s + 1); };

  const handlePlace = async () => {
    if (!user) { navigate("/login", { state: { from: { pathname: "/checkout" } } }); return; }
    setPlacing(true);
    try {
      const items = grouped.map(i => ({ product_id: i.id, qty: i.qty }));
      const { data } = await ordersAPI.create({ items, shippingAddress: address, paymentMethod: payment, notes });
      setOrderId(data.id); setStep(2); clearCart?.();
    } catch (e) { alert(e.response?.data?.message || "Failed to place order"); }
    finally { setPlacing(false); }
  };

  if (cartItems.length === 0 && !orderId) { navigate("/cart"); return null; }

  const set = (key) => (e) => { setAddress(a => ({ ...a, [key]: e.target.value })); if (errors[key]) setErrors(er => ({ ...er, [key]: "" })); };

  const SidePanel = () => (
    <div className="md:col-span-1">
      <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
        <h3 className="font-black text-lg mb-4" style={{ fontFamily:"'Georgia', serif" }}>Order</h3>
        <div className="space-y-3 mb-4">
          {grouped.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-black leading-none">{item.qty}</span>
              </div>
              <p className="text-xs text-gray-700 flex-1 leading-snug">{item.name}</p>
              <p className="text-xs font-bold">PKR {Number(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>PKR {Number(subtotal).toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span className={shippingCost===0?"text-green-600 font-medium":""}>{shippingCost===0?"Free":`PKR ${Number(shippingCost).toLocaleString()}`}</span></div>
          <div className="flex justify-between font-black text-base pt-1 border-t"><span>Total</span><span>PKR {Number(total).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-8 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.jpg" alt="Andaaz" className="h-7 w-7 rounded-full object-cover" style={{ filter:"invert(1)" }} />
            <span className="font-black" style={{ fontFamily:"'Georgia', serif" }}>Andaaz</span>
          </div>
          <div className="flex items-center gap-4">
            {["Address","Review","Done"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition ${i<=step?"bg-white text-black":"bg-white/10 text-white/30"}`}>
                  {i < step ? <FaCheck className="text-xs" /> : i+1}
                </div>
                <span className={`text-xs uppercase tracking-widest ${i<=step?"text-white":"text-white/30"}`}>{s}</span>
                {i<2 && <div className="w-6 h-px bg-white/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="addr" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-xl mb-5" style={{ fontFamily:"'Georgia', serif" }}>Shipping Address</h2>
                  {savedAddrs.length > 0 && (
                    <div className="mb-5 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Saved Addresses</p>
                      {savedAddrs.map(a => (
                        <motion.button key={a.id} onClick={() => setAddress({ full_name:a.full_name, phone:a.phone, street:a.street, city:a.city, province:a.province, postal_code:a.postal_code||"" })}
                          whileTap={{ scale:0.98 }} className="w-full text-left p-3 rounded-xl border hover:border-black transition text-sm">
                          <span className="font-semibold">{a.full_name}</span> · {a.street}, {a.city}
                          {a.is_default && <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">Default</span>}
                        </motion.button>
                      ))}
                      <div className="border-t my-3" /><p className="text-xs text-gray-400">Or fill in manually:</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{label:"Full Name *",key:"full_name",col:"sm:col-span-2",placeholder:"Ali Khan"},{label:"Phone *",key:"phone",col:"sm:col-span-2",placeholder:"+92-300-1234567"},{label:"Street Address *",key:"street",col:"sm:col-span-2",placeholder:"House 5, Street 10"},{label:"City *",key:"city",col:"",placeholder:"Lahore"},{label:"Province *",key:"province",col:"",placeholder:"Punjab"},{label:"Postal Code",key:"postal_code",col:"sm:col-span-2",placeholder:"54000"}].map(({label,key,col,placeholder}) => (
                      <div key={key} className={col}>
                        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                        <input value={address[key]} onChange={set(key)} placeholder={placeholder}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${errors[key]?"border-red-400":"focus:border-black"}`} />
                        {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-black text-xl mb-4" style={{ fontFamily:"'Georgia', serif" }}>Payment</h2>
                  <div className="space-y-3">
                    {[{value:"cod",label:"Cash on Delivery",sub:"Pay when your order arrives"},{value:"jazzcash",label:"JazzCash",sub:"Mobile wallet"},{value:"easypaisa",label:"EasyPaisa",sub:"Mobile wallet"}].map(({value,label,sub}) => (
                      <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${payment===value?"border-black bg-gray-50":"border-gray-200"}`}>
                        <input type="radio" name="pay" value={value} checked={payment===value} onChange={()=>setPayment(value)} className="w-4 h-4 accent-black" />
                        <div><p className="font-bold text-sm">{label}</p><p className="text-xs text-gray-400">{sub}</p></div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h2 className="font-black text-base mb-3">Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Special instructions..." rows={2}
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none" />
                </div>
              </div>
              <SidePanel />
              <div className="md:col-span-2">
                <motion.button onClick={handleNext} whileTap={{ scale:0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-sm bg-black">
                  Continue <FaArrowRight className="text-xs" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="review" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h2 className="font-black text-lg mb-3" style={{ fontFamily:"'Georgia', serif" }}>Ship To</h2>
                  <p className="font-bold">{address.full_name}</p><p className="text-sm text-gray-500">{address.phone}</p>
                  <p className="text-sm text-gray-500">{address.street}</p><p className="text-sm text-gray-500">{address.city}, {address.province}</p>
                  <p className="text-sm text-gray-500 mt-1">Payment: <strong className="capitalize">{payment==="cod"?"Cash on Delivery":payment}</strong></p>
                </div>
                <div className="flex gap-3">
                  <motion.button onClick={()=>setStep(0)} whileTap={{ scale:0.97 }}
                    className="flex-1 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:border-black transition flex items-center justify-center gap-2">
                    <FaArrowLeft className="text-xs" /> Edit
                  </motion.button>
                  {!user && <p className="text-sm text-orange-500 self-center">You'll need to sign in to place the order</p>}
                  <motion.button onClick={handlePlace} disabled={placing} whileTap={{ scale:0.97 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm bg-black disabled:opacity-60">
                    <FaLock className="text-xs" /> {placing?"Placing...":" Place Order"}
                  </motion.button>
                </div>
              </div>
              <SidePanel />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="max-w-sm mx-auto text-center py-16">
              <motion.div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:"spring", stiffness:300 }}>
                <FaCheck className="text-white text-3xl" />
              </motion.div>
              <h2 className="text-3xl font-black mb-2" style={{ fontFamily:"'Georgia', serif" }}>Order Placed!</h2>
              <p className="text-gray-500 mb-1 text-sm">Thank you for your order.</p>
              {orderId && <p className="text-xs text-gray-400 font-mono mb-8">Order #{orderId.slice(-8).toUpperCase()}</p>}
              <div className="flex gap-3 justify-center">
                <motion.button onClick={()=>navigate("/")} whileTap={{ scale:0.97 }} className="px-5 py-2.5 rounded-xl border text-sm font-medium">Home</motion.button>
                {user && <motion.button onClick={()=>navigate("/profile")} whileTap={{ scale:0.97 }} className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold">My Orders</motion.button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default Checkout;
