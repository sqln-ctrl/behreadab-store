import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase session token to every request
api.interceptors.request.use((config) => {
  try {
    const session = localStorage.getItem('sb_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.access_token) {
        config.headers.Authorization = `Bearer ${parsed.access_token}`;
      }
    }
  } catch (e) {
    console.error('Token parse error:', e);
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sb_session');
      localStorage.removeItem('sb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  logout:        ()     => api.post('/auth/logout'),
  getMe:         ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Products ──────────────────────────────────────
export const productsAPI = {
  getAll:    (params)   => api.get('/products', { params }),
  getById:   (id)       => api.get(`/products/${id}`),
  create:    (data)     => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:    (id)       => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ── Orders ────────────────────────────────────────
export const ordersAPI = {
  create:      (data)     => api.post('/orders', data),
  getMyOrders: ()         => api.get('/orders/my'),
  getById:     (id)       => api.get(`/orders/${id}`),
  markAsPaid:  (id, data) => api.put(`/orders/${id}/pay`, data),
};

// ── Users ─────────────────────────────────────────
export const usersAPI = {
  getWishlist:    ()           => api.get('/users/wishlist'),
  toggleWishlist: (product_id) => api.post('/users/wishlist/toggle', { product_id }),
  getAddresses:   ()           => api.get('/users/addresses'),
  addAddress:     (data)       => api.post('/users/addresses', data),
  updateAddress:  (id, data)   => api.put(`/users/addresses/${id}`, data),
  deleteAddress:  (id)         => api.delete(`/users/addresses/${id}`),
};

// ── Admin ─────────────────────────────────────────
export const adminAPI = {
  getStats:          ()         => api.get('/admin/stats'),
  getHeroConfig:     ()         => api.get('/admin/hero'),
  updateHeroConfig:  (data)     => api.put('/admin/hero', data),
  uploadHeroMedia:   (data)     => api.post('/admin/upload-hero-media', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAllUsers:        (params)   => api.get('/admin/users', { params }),
  getUserById:       (id)       => api.get(`/admin/users/${id}`),
  updateUser:        (id, data) => api.put(`/admin/users/${id}`, data),
  getAllOrders:       (params)   => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ── Inventory ─────────────────────────────────────
export const inventoryAPI = {
  getStock:             ()          => api.get('/inventory/stock'),
  adjustStock:          (data)      => api.post('/inventory/adjust', data),
  getTransactions:      (params)    => api.get('/inventory/transactions', { params }),
  getSuppliers:         ()          => api.get('/inventory/suppliers'),
  createSupplier:       (data)      => api.post('/inventory/suppliers', data),
  updateSupplier:       (id, data)  => api.put(`/inventory/suppliers/${id}`, data),
  deleteSupplier:       (id)        => api.delete(`/inventory/suppliers/${id}`),
  getPurchaseOrders:    (params)    => api.get('/inventory/purchase-orders', { params }),
  createPurchaseOrder:  (data)      => api.post('/inventory/purchase-orders', data),
  updatePurchaseOrder:  (id, data)  => api.put(`/inventory/purchase-orders/${id}`, data),
  receivePurchaseOrder: (id, data)  => api.put(`/inventory/purchase-orders/${id}/receive`, data),
};

// ── Accounting ────────────────────────────────────
export const accountingAPI = {
  getSummary:      (params) => api.get('/accounting/summary', { params }),
  getPnL:          (params) => api.get('/accounting/pnl', { params }),
  getLedger:       (params) => api.get('/accounting/ledger', { params }),
  getBalanceSheet: ()       => api.get('/accounting/balance-sheet'),
  recordExpense:   (data)   => api.post('/accounting/expense', data),
};

// ── Discounts ─────────────────────────────────────
export const discountsAPI = {
  getAll:     ()     => api.get('/discounts'),
  getAllAdmin: ()     => api.get('/discounts/all'),
  create:     (data) => api.post('/discounts', data),
  remove:     (id)   => api.delete(`/discounts/${id}`),
};

export default api;
