import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes, FaBox, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useAuth from "../hooks/useAuth";

const WatchDial = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <circle cx="13" cy="13" r="11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
    <circle cx="13" cy="13" r="1.3" fill="white" />
    <line x1="13" y1="13" x2="13" y2="6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="13" y1="13" x2="17.5" y2="13" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
    {[0,90,180,270].map(deg => {
      const x1 = 13 + 10 * Math.sin(deg * Math.PI / 180);
      const y1 = 13 - 10 * Math.cos(deg * Math.PI / 180);
      const x2 = 13 + 8.5 * Math.sin(deg * Math.PI / 180);
      const y2 = 13 - 8.5 * Math.cos(deg * Math.PI / 180);
      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />;
    })}
  </svg>
);

const Navbar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { cartItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const COLLAPSE_AT = 80;
  const isCollapsed = scrollY > COLLAPSE_AT && !hovered && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

useEffect(() => {
  const handler = (e) => {
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(e.target)
    ) {
      setUserMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handler);

  return () => {
    document.removeEventListener("mousedown", handler);
  };
}, []);
  const navLinks = [{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setHovered(h => !h)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
style={{
  width: isCollapsed ? "56px" : "min(95vw, 1280px)",
  transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
  background: "rgba(0,0,0,0.82)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "999px",
  boxShadow: isCollapsed
    ? "0 4px 16px rgba(0,0,0,0.5)"
    : "0 8px 32px rgba(0,0,0,0.3)",
  overflow: isCollapsed ? "hidden" : "visible",
}}
      >
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div key="dial"
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className="w-14 h-14 flex items-center justify-center cursor-pointer"
              title="Hover to expand">
              <WatchDial />
            </motion.div>
          ) : (
            <motion.div key="full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 md:px-7 py-2.5 flex items-center justify-between gap-4">

              <Link to="/" className="flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter: "invert(1)" }} />
                  <span className="text-white font-black text-lg hidden sm:block" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</span>
                </div>
              </Link>

              <ul className="hidden md:flex items-center gap-7">
                {navLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}>
                      <span className={`text-xs uppercase tracking-widest font-medium transition-colors ${location.pathname === to ? "text-white" : "text-gray-400 hover:text-white"}`}>
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 text-gray-300">
                <Link to="/cart">
                  <motion.button className="relative" whileHover={{ color: "#fff", scale: 1.12 }} whileTap={{ scale: 0.9 }}>
                    <FaShoppingCart className="text-base" />
                    <AnimatePresence>
                      {cartItems.length > 0 && (
                        <motion.span key={cartItems.length}
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-black leading-none">
                          {cartItems.length > 9 ? "9+" : cartItems.length}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </Link>

                <div className="relative hidden md:block" ref={userMenuRef}>
                  <motion.button
  onMouseDown={(e)=>{
    e.stopPropagation();
  }}
  onClick={()=>{
    setUserMenuOpen(prev => !prev);
  }}
>
                    {user ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black text-xs font-black">{user.name?.[0]?.toUpperCase()}</div>
                    ) : <FaUser className="text-sm" />}
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.18 }}
                        className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl w-52 py-2 z-[9999] border border-gray-100">
                        {user ? (
                          <>
                            <div className="px-4 py-3 border-b">
                              <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                            <Link to="/profile"><button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"><FaUser className="text-xs text-gray-400" /> My Profile</button></Link>
                            <Link to="/orders"><button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"><FaBox className="text-xs text-gray-400" /> My Orders</button></Link>
                            {isAdmin && <Link to="/admin/dashboard"><button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"><FaShieldAlt className="text-xs" /> Admin Panel</button></Link>}
                            <div className="border-t mt-1 pt-1">
                              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"><FaSignOutAlt className="text-xs" /> Sign Out</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Link to="/login"><button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"><FaUser className="text-xs text-gray-400" /> Sign In</button></Link>
                            <Link to="/register"><button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"><FaUser className="text-xs text-gray-400" /> Create Account</button></Link>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }}>
                  {mobileOpen ? <FaTimes /> : <FaBars />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-black z-50 p-6 md:hidden border-l border-white/10 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpg" alt="Andaaz" className="h-8 w-8 rounded-full object-cover" style={{ filter: "invert(1)" }} />
                  <span className="text-white font-black" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</span>
                </div>
                <motion.button onClick={() => setMobileOpen(false)} whileTap={{ scale: 0.9 }} className="text-white/60">
                  <FaTimes />
                </motion.button>
              </div>

              {user && (
                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black font-black flex-shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{user.name}</p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <ul className="space-y-1 flex-1">
                {navLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className={`block px-4 py-3 text-sm font-medium rounded-xl transition ${location.pathname === to ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>{label}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/cart" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition">
                    <FaShoppingCart className="text-xs" /> Cart
                    {cartItems.length > 0 && <span className="ml-auto bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">{cartItems.length}</span>}
                  </Link>
                </li>
                {user ? (
                  <>
                    <li><Link to="/profile" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition">Profile</Link></li>
                    <li><Link to="/orders" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition">My Orders</Link></li>
                    {isAdmin && <li><Link to="/admin/dashboard" className="block px-4 py-3 text-sm font-bold rounded-xl text-white hover:bg-white/5 transition">Admin Panel</Link></li>}
                    <li className="pt-3 mt-3 border-t border-white/10">
                      <button onClick={logout} className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 transition">Sign Out</button>
                    </li>
                  </>
                ) : (
                  <li className="pt-3 mt-3 border-t border-white/10 space-y-2">
                    <Link to="/login" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition">Sign In</Link>
                    <Link to="/register" className="block px-4 py-3 text-sm font-bold rounded-xl bg-white text-black text-center">Create Account</Link>
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </>
  );
};

export default Navbar;
