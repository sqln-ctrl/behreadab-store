import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaHeart, FaBox, FaSignOutAlt, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { authAPI, usersAPI, ordersAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const STATUS_COLORS = {
  Pending:    { bg: "#fef3c7", text: "#92400e" },
  Processing: { bg: "#dbeafe", text: "#1e40af" },
  Shipped:    { bg: "#ede9fe", text: "#5b21b6" },
  Delivered:  { bg: "#dcfce7", text: "#166534" },
  Cancelled:  { bg: "#fee2e2", text: "#991b1b" },
};

const tabs = [
  { id: "profile",   label: "Profile",   icon: <FaUser /> },
  { id: "orders",    label: "My Orders", icon: <FaBox /> },
  { id: "addresses", label: "Addresses", icon: <FaMapMarkerAlt /> },
  { id: "wishlist",  label: "Wishlist",  icon: <FaHeart /> },
];

const EMPTY_ADDR = { full_name: "", phone: "", street: "", city: "", province: "", postal_code: "", is_default: false };

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const [editForm,  setEditForm]  = useState({ name: user?.name || "", email: user?.email || "", password: "", confirm: "" });
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState("");
  const [saveError, setSaveError] = useState("");

  // Orders
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Addresses
  const [addresses,    setAddresses]    = useState([]);
  const [addrLoading,  setAddrLoading]  = useState(false);
  const [addrModal,    setAddrModal]    = useState(false);
  const [editingAddr,  setEditingAddr]  = useState(null);
  const [addrForm,     setAddrForm]     = useState(EMPTY_ADDR);
  const [addrSaving,   setAddrSaving]   = useState(false);

  // Wishlist
  const [wishlist,        setWishlist]        = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      setOrdersLoading(true);
      ordersAPI.getMyOrders()
        .then(({ data }) => setOrders(data))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
    if (activeTab === "addresses") {
      setAddrLoading(true);
      usersAPI.getAddresses()
        .then(({ data }) => setAddresses(data))
        .catch(console.error)
        .finally(() => setAddrLoading(false));
    }
    if (activeTab === "wishlist") {
      setWishlistLoading(true);
      usersAPI.getWishlist()
        .then(({ data }) => setWishlist(data))
        .catch(console.error)
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setSaveError(""); setSaveMsg("");
    if (editForm.password && editForm.password !== editForm.confirm)
      return setSaveError("Passwords do not match");
    setSaving(true);
    try {
      const payload = { name: editForm.name, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      const { data } = await authAPI.updateProfile(payload);
      updateUser(data);
      setSaveMsg("Profile updated!");
      setEditForm((f) => ({ ...f, password: "", confirm: "" }));
    } catch (err) { setSaveError(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const openAddrModal = (addr = null) => {
    setEditingAddr(addr);
    setAddrForm(addr ? { full_name: addr.full_name, phone: addr.phone, street: addr.street, city: addr.city, province: addr.province, postal_code: addr.postal_code || "", is_default: addr.is_default } : EMPTY_ADDR);
    setAddrModal(true);
  };

  const handleSaveAddr = async () => {
    setAddrSaving(true);
    try {
      if (editingAddr) await usersAPI.updateAddress(editingAddr.id, addrForm);
      else             await usersAPI.addAddress(addrForm);
      const { data } = await usersAPI.getAddresses();
      setAddresses(data);
      setAddrModal(false);
    } catch (err) { console.error(err); }
    finally { setAddrSaving(false); }
  };

  const handleDeleteAddr = async (id) => {
    await usersAPI.deleteAddress(id);
    setAddresses((a) => a.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white text-black text-2xl font-black flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 text-white/40">My Account</p>
            <h1 className="text-2xl md:text-3xl font-black" style={{ fontFamily: "'Georgia', serif" }}>{user?.name}</h1>
            <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              {tabs.map((tab) => (
                <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={{ background: activeTab === tab.id ? "#000" : "transparent", color: activeTab === tab.id ? "#fff" : "#6b7280" }}>
                  <span>{tab.icon}</span>{tab.label}
                </motion.button>
              ))}
              <div className="border-t mt-2 pt-2">
                <motion.button onClick={logout} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all text-left">
                  <FaSignOutAlt /> Sign Out
                </motion.button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                {/* ── Profile ── */}
                {activeTab === "profile" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Georgia', serif" }}>Edit Profile</h2>
                    {saveMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5">{saveMsg}</div>}
                    {saveError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">{saveError}</div>}
                    <div className="space-y-5">
                      {[
                        { label: "Full Name",        key: "name",     type: "text",     icon: <FaUser /> },
                        { label: "Email Address",    key: "email",    type: "email",    icon: <FaEnvelope /> },
                        { label: "New Password",     key: "password", type: "password", icon: <FaLock />, placeholder: "Leave blank to keep current" },
                        { label: "Confirm Password", key: "confirm",  type: "password", icon: <FaLock />, placeholder: "Repeat new password" },
                      ].map(({ label, key, type, icon, placeholder }) => (
                        <div key={key}>
                          <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">{label}</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                            <input type={type} value={editForm[key]} placeholder={placeholder || ""}
                              onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                              className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-black transition text-gray-800 placeholder-gray-300" />
                          </div>
                        </div>
                      ))}
                      <motion.button onClick={handleSaveProfile} disabled={saving} whileTap={{ scale: 0.97 }}
                        className="px-8 py-3 rounded-xl font-bold text-white text-sm uppercase tracking-widest disabled:opacity-60 bg-black">
                        {saving ? "Saving..." : "Save Changes"}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* ── Orders ── */}
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>My Orders</h2>
                    {ordersLoading ? <Loader /> : orders.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-gray-400">
                        <FaBox className="text-5xl mx-auto mb-4 text-gray-200" />
                        <p className="font-semibold">No orders yet</p>
                        <Link to="/shop" className="mt-3 inline-block text-sm text-black underline">Start shopping</Link>
                      </div>
                    ) : orders.map((order) => {
                      const style = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
                      return (
                        <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-widest">Order #{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{ background: style.bg, color: style.text }}>{order.status}</span>
                              <span className="font-black text-black">PKR {Number(order.total_amount).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Addresses ── */}
                {activeTab === "addresses" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>Saved Addresses</h2>
                      <motion.button onClick={() => openAddrModal()} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-black">
                        <FaPlus className="text-xs" /> Add
                      </motion.button>
                    </div>
                    {addrLoading ? <Loader /> : addresses.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-gray-400">
                        <FaMapMarkerAlt className="text-5xl mx-auto mb-4 text-gray-200" />
                        <p className="font-semibold">No saved addresses</p>
                      </div>
                    ) : addresses.map((addr) => (
                      <div key={addr.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900">{addr.full_name}</p>
                              {addr.is_default && <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Default</span>}
                            </div>
                            <p className="text-sm text-gray-500">{addr.phone}</p>
                            <p className="text-sm text-gray-500">{addr.street}, {addr.city}</p>
                            <p className="text-sm text-gray-500">{addr.province} {addr.postal_code}</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button onClick={() => openAddrModal(addr)} whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition">
                              <FaEdit className="text-xs" />
                            </motion.button>
                            <motion.button onClick={() => handleDeleteAddr(addr.id)} whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition">
                              <FaTrash className="text-xs" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Wishlist ── */}
                {activeTab === "wishlist" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>My Wishlist</h2>
                    {wishlistLoading ? <Loader /> : wishlist.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-gray-400">
                        <FaHeart className="text-5xl mx-auto mb-4 text-gray-200" />
                        <p className="font-semibold">Your wishlist is empty</p>
                        <Link to="/shop" className="mt-3 inline-block text-sm text-black underline">Browse watches</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {wishlist.map((item) => (
                          <ProductCard key={item.id}
                            id={item.products?.id || item.product_id}
                            image={item.products?.image}
                            name={item.products?.name}
                            price={item.products?.price}
                            originalPrice={item.products?.original_price}
                            category={item.products?.category}
                            badge={item.products?.badge}
                            rating={item.products?.rating}
                            reviews={item.products?.num_reviews}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {addrModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAddrModal(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="font-black text-xl mb-5">{editingAddr ? "Edit Address" : "Add Address"}</h2>
              <div className="space-y-4">
                {[
                  { label: "Full Name *",  key: "full_name",   placeholder: "Ali Khan" },
                  { label: "Phone *",      key: "phone",       placeholder: "+92-300-1234567" },
                  { label: "Street *",     key: "street",      placeholder: "House 5, Street 10, DHA Phase 2" },
                  { label: "City *",       key: "city",        placeholder: "Lahore" },
                  { label: "Province *",   key: "province",    placeholder: "Punjab" },
                  { label: "Postal Code",  key: "postal_code", placeholder: "54000" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
                    <input value={addrForm[key]} onChange={(e) => setAddrForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="default" checked={addrForm.is_default}
                    onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))}
                    className="w-4 h-4" />
                  <label htmlFor="default" className="text-sm font-medium text-gray-700">Set as default address</label>
                </div>
                <motion.button onClick={handleSaveAddr} disabled={addrSaving} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-widest disabled:opacity-60 bg-black">
                  {addrSaving ? "Saving..." : "Save Address"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
