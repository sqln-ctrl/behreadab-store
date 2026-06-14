import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const session = localStorage.getItem('sb_session');
  if (session) {
    const parsed = JSON.parse(session);
    config.headers.Authorization = `Bearer ${parsed.access_token}`;
  }
  return config;
});

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

export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  logout:        ()     => api.post('/auth/logout'),
  getMe:         ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productsAPI = {
  getAll:    (params)   => api.get('/products', { params }),
  getById:   (id)       => api.get(`/products/${id}`),
  create:    (data)     => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:    (id)       => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const ordersAPI = {
  create:      (data)     => api.post('/orders', data),
  getMyOrders: ()         => api.get('/orders/my'),
  getById:     (id)       => api.get(`/orders/${id}`),
  markAsPaid:  (id, data) => api.put(`/orders/${id}/pay`, data),
};

export const usersAPI = {
  getWishlist:    ()           => api.get('/users/wishlist'),
  toggleWishlist: (product_id) => api.post('/users/wishlist/toggle', { product_id }),
  getAddresses:   ()           => api.get('/users/addresses'),
  addAddress:     (data)       => api.post('/users/addresses', data),
  updateAddress:  (id, data)   => api.put(`/users/addresses/${id}`, data),
  deleteAddress:  (id)         => api.delete(`/users/addresses/${id}`),
};

export const adminAPI = {
  getStats:          ()         => api.get('/admin/stats'),
  getHeroConfig:     ()         => api.get('/admin/hero'),
  updateHeroConfig:  (data)     => api.put('/admin/hero', data),
  getAllUsers:        (params)   => api.get('/admin/users', { params }),
  getUserById:       (id)       => api.get(`/admin/users/${id}`),
  updateUser:        (id, data) => api.put(`/admin/users/${id}`, data),
  getAllOrders:       (params)   => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const inventoryAPI = {
  getStock:            ()          => api.get('/inventory/stock'),
  adjustStock:         (data)      => api.post('/inventory/adjust', data),
  getTransactions:     (params)    => api.get('/inventory/transactions', { params }),
  getSuppliers:        ()          => api.get('/inventory/suppliers'),
  createSupplier:      (data)      => api.post('/inventory/suppliers', data),
  updateSupplier:      (id, data)  => api.put(`/inventory/suppliers/${id}`, data),
  deleteSupplier:      (id)        => api.delete(`/inventory/suppliers/${id}`),
  getPurchaseOrders:   (params)    => api.get('/inventory/purchase-orders', { params }),
  createPurchaseOrder: (data)      => api.post('/inventory/purchase-orders', data),
  updatePurchaseOrder: (id, data)  => api.put(`/inventory/purchase-orders/${id}`, data),
  receivePurchaseOrder:(id, data)  => api.put(`/inventory/purchase-orders/${id}/receive`, data),
};

export const accountingAPI = {
  getSummary:      (params) => api.get('/accounting/summary', { params }),
  getPnL:          (params) => api.get('/accounting/pnl', { params }),
  getLedger:       (params) => api.get('/accounting/ledger', { params }),
  getBalanceSheet: ()       => api.get('/accounting/balance-sheet'),
  recordExpense:   (data)   => api.post('/accounting/expense', data),
};

export default api;
