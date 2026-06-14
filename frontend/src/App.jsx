import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/AdminLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./components/Cart";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHero from "./pages/admin/AdminHero";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminPurchaseOrders from "./pages/admin/AdminPurchaseOrders";
import AdminAccounting from "./pages/admin/AdminAccounting";
import OrderReceipt from "./pages/admin/OrderReceipt";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const DARK_PAGES   = ["/login", "/register"];
const ADMIN_PREFIX = "/admin";
const RECEIPT_PATH = /^\/admin\/orders\/.+\/receipt$/;

const PublicRoutes = () => {
  const location = useLocation();
  const isDark    = DARK_PAGES.includes(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/"            element={<Home />} />
          <Route path="/shop"        element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/cart"        element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders"      element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        </Routes>
        {!isDark && <Footer />}
      </motion.div>
    </AnimatePresence>
  );
};

const AdminRoutes = () => (
  <AdminRoute>
    <AdminLayout>
      <Routes>
        <Route path="/admin/dashboard"       element={<Dashboard />} />
        <Route path="/admin/products"        element={<AdminProducts />} />
        <Route path="/admin/orders"          element={<AdminOrders />} />
        <Route path="/admin/orders/:id/receipt" element={<OrderReceipt />} />
        <Route path="/admin/users"           element={<AdminUsers />} />
        <Route path="/admin/hero"            element={<AdminHero />} />
        <Route path="/admin/inventory"       element={<AdminInventory />} />
        <Route path="/admin/suppliers"       element={<AdminSuppliers />} />
        <Route path="/admin/purchase-orders" element={<AdminPurchaseOrders />} />
        <Route path="/admin/accounting"      element={<AdminAccounting />} />
      </Routes>
    </AdminLayout>
  </AdminRoute>
);

const AppRouter = () => {
  const location = useLocation();
  const isAdmin   = location.pathname.startsWith(ADMIN_PREFIX);
  const isReceipt = RECEIPT_PATH.test(location.pathname);

  if (isAdmin) {
    return isReceipt
      ? <AdminRoute><Routes><Route path="/admin/orders/:id/receipt" element={<OrderReceipt />} /></Routes></AdminRoute>
      : <AdminRoutes />;
  }

  return (
    <>
      <Navbar />
      <PublicRoutes />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
