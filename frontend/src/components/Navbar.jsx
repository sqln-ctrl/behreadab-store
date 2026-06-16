import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes, FaBox, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(0,0,0,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div className="flex items-center gap-3" whileHover={{ opacity: 0.85 }} transition={{ duration: 0.2 }}>
              <img src="/logo.jpg" alt="Andaaz" className="h-10 w-10 rounded-full object-cover" style={{ filter: "invert(1)" }} />
              <span className="text-white font-black text-xl tracking-tight hidden sm:block" style={{ fontFamily: "'Georgia', serif" }}>
                Andaaz
              </span>
            </motion.div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, to }, i) => (
              <motion.li key={label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                <Link to={to}>
                  <motion.span
                    className="text-gray-300 text-sm uppercase tracking-widest relative"
                    whileHover={{ color: "#ffffff" }}
                  >
                    {label}
                    {location.pathname === to && (
                      <motion.span layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white" />
                    )}
                  </motion.span>
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-4 text-lg text-gray-300">
            <motion.button whileHover={{ color: "#fff", scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <FaHeart />
            </motion.button>

            <Link to="/cart">
              <motion.button className="relative" whileHover={{ color: "#fff", scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <FaShoppingCart />
                <AnimatePresence>
                  {cartItems.length > 0 && (
                    <motion.span key={cartItems.length}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-2 -right-3 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
                      {cartItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>

            {/* User menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <motion.button onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ color: "#fff", scale: 1.15 }} whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2">
                {user ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black text-xs font-black">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                ) : <FaUser />}
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl w-52 py-2 z-50 border border-gray-100">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b">
                          <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile">
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                            <FaUser className="text-gray-400" /> My Profile
                          </button>
                        </Link>
                        <Link to="/orders">
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                            <FaBox className="text-gray-400" /> My Orders
                          </button>
                        </Link>
                        {isAdmin && (
                          <Link to="/admin/dashboard">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                              <FaShieldAlt className="text-black" /> Admin Panel
                            </button>
                          </Link>
                        )}
                        <div className="border-t mt-1 pt-1">
                          <button onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                            <FaSignOutAlt /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/login">
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                            <FaUser className="text-gray-400" /> Sign In
                          </button>
                        </Link>
                        <Link to="/register">
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                            <FaUser className="text-gray-400" /> Create Account
                          </button>
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <motion.button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }}>
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-black z-50 p-6 md:hidden border-l border-white/10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter: "invert(1)" }} />
                  <span className="text-white font-black text-lg" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</span>
                </div>
                <motion.button onClick={() => setMobileOpen(false)} whileTap={{ scale: 0.9 }} className="text-white">
                  <FaTimes />
                </motion.button>
              </div>

              {user && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black font-black">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{user.name}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </div>
              )}

              <ul className="space-y-1">
                {navLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">{label}</Link>
                  </li>
                ))}
                {user ? (
                  <>
                    <li><Link to="/profile" className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">Profile</Link></li>
                    <li><Link to="/orders" className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">My Orders</Link></li>
                    {isAdmin && <li><Link to="/admin/dashboard" className="block px-4 py-3 text-white font-bold rounded-xl hover:bg-white/5 transition">Admin Panel</Link></li>}
                    <li><button onClick={logout} className="w-full text-left px-4 py-3 text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition">Sign Out</button></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">Sign In</Link></li>
                    <li><Link to="/register" className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">Create Account</Link></li>
                  </>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div style={{ height: "72px" }} />
    </>
  );
};

export default Navbar;
