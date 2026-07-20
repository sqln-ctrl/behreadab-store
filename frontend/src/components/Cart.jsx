import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaArrowLeft, FaShoppingBag } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import useSettings from "../hooks/useSettings";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const grouped = cartItems.reduce((acc, item) => {
    const ex = acc.find(i => i.id === item.id);
    if (ex) ex.qty += 1;
    else acc.push({ ...item, qty: 1 });
    return acc;
  }, []);

  const subtotal     = cartItems.reduce((acc, i) => acc + i.price, 0);
  const shippingCost = subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const total        = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-10 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs mb-2 text-white/40">Your Selection</p>
          <h1 className="text-4xl font-black" style={{ fontFamily:"'Georgia', serif" }}>Cart</h1>
          <p className="text-white/40 text-sm mt-1">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition mb-6">
          <FaArrowLeft className="text-xs" /> Continue shopping
        </Link>

        {grouped.length === 0 ? (
          <div className="text-center py-20">
            <FaShoppingBag className="text-6xl text-gray-200 mx-auto mb-5" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-7 text-sm">Add some watches to get started</p>
            <Link to="/shop"><motion.button whileTap={{ scale:0.97 }} className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-black">Shop Now</motion.button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <AnimatePresence>
                {grouped.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                      <p className="font-black text-sm mt-1">PKR {Number(item.price * item.qty).toLocaleString()}</p>
                    </div>
                    <motion.button onClick={() => removeFromCart(item.id)} whileTap={{ scale:0.9 }}
                      className="w-9 h-9 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition flex-shrink-0">
                      <FaTrash className="text-xs" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="order-first md:order-last">
              <div className="bg-black text-white rounded-2xl p-5 md:sticky md:top-24">
                <h2 className="font-black text-lg mb-5" style={{ fontFamily:"'Georgia', serif" }}>Summary</h2>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-white/60"><span>Subtotal</span><span>PKR {Number(subtotal).toLocaleString()}</span></div>
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-400 font-medium" : ""}>{shippingCost === 0 ? "Free" : `PKR ${Number(shippingCost).toLocaleString()}`}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-black text-lg">
                    <span>Total</span><span>PKR {Number(total).toLocaleString()}</span>
                  </div>
                </div>
                {subtotal < settings.free_delivery_threshold && (
                  <p className="text-xs text-white/30 text-center mb-4">Add PKR {Number(settings.free_delivery_threshold - subtotal).toLocaleString()} more for free shipping</p>
                )}
                <motion.button onClick={() => navigate("/checkout")} whileTap={{ scale:0.97 }}
                  className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest bg-white text-black hover:bg-gray-100 transition">
                  Proceed to Checkout
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Cart;
