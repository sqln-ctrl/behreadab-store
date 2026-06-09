import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// ── Products ──
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),           // FormData for images
  update: (id, data) => api.put(`/products/${id}`, data),  // FormData for images
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ── Orders ──
export const ordersAPI = {
  create: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders/my"),
  getById: (id) => api.get(`/orders/${id}`),
  markAsPaid: (id, data) => api.put(`/orders/${id}/pay`, data),
};

// ── Users ──
export const usersAPI = {
  getWishlist: () => api.get("/users/wishlist"),
  toggleWishlist: (productId) => api.post("/users/wishlist", { productId }),
  saveAddress: (data) => api.post("/users/address", data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
};

// ── Admin ──
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getHeroConfig: () => api.get("/admin/hero"),
  updateHeroConfig: (data) => api.put("/admin/hero", data),
  getAllOrders: (params) => api.get("/orders", { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getAllUsers: (params) => api.get("/users", { params }),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

export default api;
