import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartBar, FaBox, FaShoppingBag, FaUsers, FaImage,
  FaWarehouse, FaTruck, FaFileInvoiceDollar, FaBars,
  FaTimes, FaSignOutAlt, FaStore
} from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: <FaChartBar /> }],
  },
  {
    label: "Store",
    items: [
      { to: "/admin/products",  label: "Products",    icon: <FaBox /> },
      { to: "/admin/orders",    label: "Orders",      icon: <FaShoppingBag /> },
      { to: "/admin/users",     label: "Users",       icon: <FaUsers /> },
      { to: "/admin/hero",      label: "Hero Editor", icon: <FaImage /> },
    ],
  },
  {
    label: "Inventory",
    items: [
      { to: "/admin/inventory",       label: "Stock Levels",    icon: <FaWarehouse /> },
      { to: "/admin/suppliers",       label: "Suppliers",       icon: <FaTruck /> },
      { to: "/admin/purchase-orders", label: "Purchase Orders", icon: <FaBox /> },
    ],
  },
  {
    label: "Finance",
    items: [{ to: "/admin/accounting", label: "Accounting", icon: <FaFileInvoiceDollar /> }],
  },
];

const SidebarLink = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const active   = location.pathname === to;
  return (
    <Link to={to} onClick={onClick}>
      <motion.div whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: active ? "#fff" : "transparent", color: active ? "#000" : "rgba(255,255,255,0.4)" }}>
        <span className="text-base flex-shrink-0">{icon}</span>
        {label}
      </motion.div>
    </Link>
  );
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout }  = useAuth();
  const location          = useLocation();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const currentLabel = navGroups
    .flatMap((g) => g.items)
    .find((n) => n.to === location.pathname)?.label || "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter: "invert(1)" }} />
          <div>
            <h1 className="text-lg font-black text-white" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</h1>
            <p className="text-xs text-white/30 uppercase tracking-widest">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/25 px-4 mb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-black font-black text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/30 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-white/40 hover:bg-white/5 transition">
              <FaStore className="text-xs" /> Store
            </button>
          </Link>
          <button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition">
            <FaSignOutAlt className="text-xs" /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-black flex-shrink-0 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-60 bg-black z-50 md:hidden flex flex-col">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500"><FaBars /></button>
            <h2 className="font-bold text-gray-800">{currentLabel}</h2>
          </div>
          <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">Admin</span>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
