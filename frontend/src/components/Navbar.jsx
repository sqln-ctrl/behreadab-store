import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartItems } = useContext(CartContext);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
    { label: "Cart", to: "/cart" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(0,0,0,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,175,55,0.15)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.h1
              className="text-2xl font-black text-white cursor-pointer tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
              whileHover={{ color: "#d4af37" }}
              transition={{ duration: 0.2 }}
            >
              Watch<span style={{ color: "#d4af37" }}>Store</span>
            </motion.h1>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8 font-medium">
            {navLinks.map(({ label, to }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              >
                <Link to={to}>
                  <motion.span
                    className="text-gray-300 text-sm uppercase tracking-widest relative"
                    whileHover={{ color: "#d4af37" }}
                    transition={{ duration: 0.2 }}
                  >
                    {label}
                    {location.pathname === to && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5"
                        style={{ background: "#d4af37" }}
                      />
                    )}
                  </motion.span>
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Icons */}
          <motion.div
            className="flex items-center gap-5 text-xl text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ color: "#ef4444", scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="transition"
            >
              <FaHeart />
            </motion.button>

            <Link to="/cart">
              <motion.button
                className="relative transition"
                whileHover={{ color: "#d4af37", scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaShoppingCart />
                <AnimatePresence>
                  {cartItems.length > 0 && (
                    <motion.span
                      key={cartItems.length}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-3 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                      style={{ background: "#d4af37" }}
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ color: "#60a5fa", scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="transition"
            >
              <FaUser />
            </motion.button>

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10 md:hidden"
          >
            <ul className="flex flex-col px-8 py-6 gap-6">
              {navLinks.map(({ label, to }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={to}
                    className="text-gray-300 text-lg font-medium uppercase tracking-widest hover:text-yellow-400 transition"
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div style={{ height: "72px" }} />
    </>
  );
};

export default Navbar;
