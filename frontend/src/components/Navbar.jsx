import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaBox, FaSignOutAlt, FaShieldAlt
} from "react-icons/fa";
import useCart from "../hooks/useCart";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const [scrolled,     setScrolled]     = useState(false);
  const [hovered,      setHovered]      = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [btnPos,       setBtnPos]       = useState({ top: 0, right: 0 });

  const { cartItems }             = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location                  = useLocation();
  const userBtnRef                = useRef(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  // Close dropdown when clicking anywhere outside the button
  useEffect(() => {
    const handler = (e) => {
      if (userBtnRef.current && !userBtnRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Track button position so the portal-style dropdown appears in right place
  const openUserMenu = (e) => {
    e.stopPropagation();
    if (userBtnRef.current) {
      const rect = userBtnRef.current.getBoundingClientRect();
      setBtnPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setUserMenuOpen(o => !o);
  };

  const isCollapsed = scrolled && !hovered;
  const navLinks = [{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }];

  return (
    <>
      {/* ── Navbar pill ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
        style={{
          background:     "rgba(0,0,0,0.88)",
          backdropFilter: "blur(20px)",
          border:         "1px solid rgba(255,255,255,0.08)",
          borderRadius:   "999px",
          boxShadow:      "0 8px 32px rgba(0,0,0,0.35)",
          // KEY FIX: NO overflow:hidden — that was clipping the dropdown
          width: isCollapsed ? "56px" : "min(95vw, 1200px)",
        }}>

        <AnimatePresence mode="wait">
          {/* ── Collapsed: watch dial ── */}
          {isCollapsed ? (
            <motion.div key="dial"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22 }}
              onClick={() => setHovered(true)}
              className="w-14 h-14 flex items-center justify-center cursor-pointer">
              <div className="w-9 h-9">
                <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
                  <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                  <circle cx="18" cy="18" r="1.5" fill="white"/>
                  {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
                    <line key={i} x1="18" y1="4" x2="18" y2={i % 3 === 0 ? "7" : "5.5"}
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth={i % 3 === 0 ? "1.5" : "1"}
                      transform={`rotate(${deg} 18 18)`}/>
                  ))}
                  <line x1="18" y1="18" x2="18" y2="9"  stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="18" y1="18" x2="24" y2="18" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
            </motion.div>
          ) : (
            /* ── Expanded: full bar ── */
            <motion.div key="full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 md:px-8 py-3 flex items-center justify-between gap-6">

              {/* Logo */}
              <Link to="/">
                <motion.div className="flex items-center gap-2.5 flex-shrink-0" whileHover={{ opacity: 0.85 }}>
                  <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter: "invert(1)" }}/>
                  <span className="text-white font-black text-lg tracking-tight hidden sm:block" style={{ fontFamily: "'Georgia', serif" }}>
                    Andaaz
                  </span>
                </motion.div>
              </Link>

              {/* Desktop nav links */}
              <ul className="hidden md:flex items-center gap-8 flex-1 justify-center">
                {navLinks.map(({ label, to }, i) => (
                  <motion.li key={label}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}>
                    <Link to={to}>
                      <motion.span className="text-gray-300 text-sm uppercase tracking-widest relative"
                        whileHover={{ color: "#fff" }}>
                        {label}
                        {location.pathname === to && (
                          <motion.span layoutId="nav-underline"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"/>
                        )}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Right icons */}
              <div className="flex items-center gap-5 text-gray-300 flex-shrink-0">

                {/* Wishlist */}
                <Link to="/profile#wishlist">
                  <motion.div whileHover={{ color: "#fff", scale: 1.12 }} whileTap={{ scale: 0.9 }}>
                    <FaHeart className="text-base"/>
                  </motion.div>
                </Link>

                {/* Cart */}
                <Link to="/cart">
                  <motion.div className="relative" whileHover={{ color: "#fff", scale: 1.12 }} whileTap={{ scale: 0.9 }}>
                    <FaShoppingCart className="text-base"/>
                    <AnimatePresence>
                      {cartItems.length > 0 && (
                        <motion.span key={cartItems.length}
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="absolute -top-2 -right-3 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-black leading-none">
                          {cartItems.length > 9 ? "9+" : cartItems.length}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>

                {/* User button — desktop only */}
                <div className="hidden md:block" ref={userBtnRef}>
                  <motion.button
                    onClick={openUserMenu}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="focus:outline-none">
                    {user ? (
                      <div className="w-8 h-8 rounded-full bg-white text-black text-xs font-black flex items-center justify-center select-none">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    ) : (
                      <FaUser className="text-base"/>
                    )}
                  </motion.button>
                </div>

                {/* Mobile hamburger */}
                <motion.button
                  className="md:hidden"
                  onClick={(e) => { e.stopPropagation(); setMobileOpen(o => !o); }}
                  whileTap={{ scale: 0.9 }}>
                  {mobileOpen ? <FaTimes/> : <FaBars/>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── User dropdown — rendered in body, NOT inside nav ── */}
      {/* This is the KEY fix: it's outside the nav so overflow/z-index can't clip it */}
      <AnimatePresence>
        {userMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="fixed bg-white rounded-2xl shadow-2xl w-52 py-2 border border-gray-100"
            style={{ top: btnPos.top, right: btnPos.right, zIndex: 9999 }}>
            {user ? (
              <>
                <div className="px-4 py-3 border-b">
                  <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <FaUser className="text-gray-400 text-xs"/> My Profile
                  </button>
                </Link>
                <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <FaBox className="text-gray-400 text-xs"/> My Orders
                  </button>
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)}>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                      <FaShieldAlt className="text-black text-xs"/> Admin Panel
                    </button>
                  </Link>
                )}
                <div className="border-t mt-1 pt-1">
                  <button onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left">
                    <FaSignOutAlt className="text-xs"/> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setUserMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <FaUser className="text-gray-400 text-xs"/> Sign In
                  </button>
                </Link>
                <Link to="/register" onClick={() => setUserMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left">
                    <FaUser className="text-gray-400 text-xs"/> Create Account
                  </button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"/>
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-black z-50 p-6 md:hidden border-l border-white/10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter: "invert(1)" }}/>
                  <span className="text-white font-black text-lg" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</span>
                </div>
                <motion.button onClick={() => setMobileOpen(false)} whileTap={{ scale: 0.9 }} className="text-white">
                  <FaTimes/>
                </motion.button>
              </div>

              {user && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center">
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
                    <Link to={to} className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">
                      {label}
                    </Link>
                  </li>
                ))}
                {user ? (
                  <>
                    <li><Link to="/profile"         className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">Profile</Link></li>
                    <li><Link to="/orders"           className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">My Orders</Link></li>
                    <li><Link to="/profile#wishlist" className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">❤️ Wishlist</Link></li>
                    {isAdmin && <li><Link to="/admin/dashboard" className="block px-4 py-3 text-white font-bold rounded-xl hover:bg-white/5 transition">⚙️ Admin Panel</Link></li>}
                    <li>
                      <button onClick={logout} className="w-full text-left px-4 py-3 text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition">
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login"    className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">Sign In</Link></li>
                    <li><Link to="/register" className="block px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition">Create Account</Link></li>
                  </>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div style={{ height: "80px" }}/>
    </>
  );
};

export default Navbar;
