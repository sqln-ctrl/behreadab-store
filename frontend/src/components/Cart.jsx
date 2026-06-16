import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaArrowLeft, FaShoppingBag } from "react-icons/fa";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();

  const grouped = cartItems.reduce((acc, item) => {
    const existing = acc.find((i) => i.id === item.id);
    if (existing) existing.qty += 1;
    else acc.push({ ...item, qty: 1 });
    return acc;
  }, []);

  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-12 md:py-16 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-xs mb-2 text-white/40">Your Selection</p>
          <h1 className="text-4xl md:text-5xl font-black" style={{ fontFamily: "'Georgia', serif" }}>Cart</h1>
          <p className="text-white/40 mt-1 text-sm">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition mb-6">
          <FaArrowLeft className="text-xs" /> Continue shopping
        </Link>

        {grouped.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <FaShoppingBag className="text-6xl text-gray-200 mx-auto mb-5" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-7 text-sm">Add some watches to get started</p>
            <Link to="/shop">
              <motion.button whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-black">
                Shop Now
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-3 gap-8">
            {/* Items */}
            <div className="md:col-span-2 space-y-3">
              <AnimatePresence>
                {grouped.map((item) => (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                      <p className="font-black mt-1 text-sm md:text-base text-black">PKR {Number(item.price * item.qty).toLocaleString()}</p>
                    </div>
                    <motion.button onClick={() => removeFromCart(item.id)} whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition flex-shrink-0">
                      <FaTrash className="text-xs" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="md:col-span-1 order-first md:order-last">
              <div className="bg-black text-white rounded-2xl p-5 md:p-6 md:sticky md:top-24">
                <h2 className="font-black text-lg md:text-xl mb-5" style={{ fontFamily: "'Georgia', serif" }}>Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span><span>PKR {Number(total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span className={total >= 5000 ? "text-green-400 font-medium" : ""}>
                      {total >= 5000 ? "Free" : "PKR 500"}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-black text-base md:text-lg">
                    <span>Total</span>
                    <span>PKR {total >= 5000 ? Number(total).toLocaleString() : Number(total + 500).toLocaleString()}</span>
                  </div>
                </div>
                {total < 5000 && (
                  <p className="text-xs text-white/40 mt-2 text-center">Add PKR {Number(5000 - total).toLocaleString()} more for free shipping</p>
                )}
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full mt-5 py-4 rounded-xl font-bold text-sm uppercase tracking-widest bg-white text-black hover:bg-gray-100 transition">
                  Checkout
                </motion.button>
                <p className="text-xs text-white/30 text-center mt-2">SSL encrypted · Secure checkout</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
