import api from "./axiosInstance";

export const orderService = {
  // GET: List orders with filters (page, limit, status, userId)
  getAll: async (params = {}) => {
    // Backend path: /api/admin/orders (Assuming standard structure from app.js)
    const response = await api.get("/admin/orders", { params });
    return response.data;
  },

  // GET: Single order details
  getById: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  // PATCH: Update status
  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  },

  // GET: User specific orders
  getByUser: async (userId, params = {}) => {
    const response = await api.get(`/admin/orders/user/${userId}`, { params });
    return response.data;
  },
};
