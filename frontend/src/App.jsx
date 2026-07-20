import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/AdminLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Home            from "./pages/Home";
import Shop            from "./pages/Shop";
import Cart            from "./components/Cart";
import ProductDetail   from "./pages/ProductDetail";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Checkout        from "./pages/Checkout";
import Profile         from "./pages/Profile";
import OrderHistory    from "./pages/OrderHistory";

import Dashboard           from "./pages/admin/Dashboard";
import AdminProducts       from "./pages/admin/AdminProducts";
import AdminOrders         from "./pages/admin/AdminOrders";
import AdminUsers          from "./pages/admin/AdminUsers";
import AdminHero           from "./pages/admin/AdminHero";
import AdminInventory      from "./pages/admin/AdminInventory";
import AdminSuppliers      from "./pages/admin/AdminSuppliers";
import AdminPurchaseOrders from "./pages/admin/AdminPurchaseOrders";
import AdminAccounting     from "./pages/admin/AdminAccounting";
import AdminDiscounts      from "./pages/admin/AdminDiscounts";
import AdminReviews        from "./pages/admin/AdminReviews";
import AdminSettings       from "./pages/admin/AdminSettings";
import OrderReceipt        from "./pages/admin/OrderReceipt";

const NO_NAVBAR = ["/login", "/register", "/checkout"];
const NO_FOOTER = ["/login", "/register", "/checkout"];
const ADMIN_PREFIX = "/admin";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

const PublicRoutes = () => {
  const location = useLocation();
  const showNavbar = !NO_NAVBAR.includes(location.pathname);
  const showFooter = !NO_FOOTER.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/"            element={<Home />} />
            <Route path="/shop"        element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart"        element={<Cart />} />
            <Route path="/checkout"    element={<Checkout />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders"      element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          </Routes>
          {showFooter && <Footer />}
        </motion.div>
      </AnimatePresence>
    </>
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
        <Route path="/admin/discounts"       element={<AdminDiscounts />} />
        <Route path="/admin/reviews"         element={<AdminReviews />} />
        <Route path="/admin/settings"        element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  </AdminRoute>
);

const AppRouter = () => {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith(ADMIN_PREFIX);
  const isReceipt = /^\/admin\/orders\/.+\/receipt$/.test(location.pathname);

  if (isAdmin) {
    if (isReceipt) return <AdminRoute><Routes><Route path="/admin/orders/:id/receipt" element={<OrderReceipt />} /></Routes></AdminRoute>;
    return <AdminRoutes />;
  }
  return <PublicRoutes />;
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
