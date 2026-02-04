import api from "./axiosInstance";

export const couponService = {
  // GET: List all coupons
  // Backend path defined in app.js: /api/v1/admin/coupons
  getAll: async (params = {}) => {
    const response = await api.get("/v1/admin/coupons", { params });
    return response.data;
  },

  // POST: Create new coupon
  create: async (data) => {
    const response = await api.post("/v1/admin/coupons", data);
    return response.data;
  },

  // PUT: Update existing coupon
  update: async (id, data) => {
    const response = await api.put(`/v1/admin/coupons/${id}`, data);
    return response.data;
  },

  // PATCH: Toggle status
  toggleStatus: async (id) => {
    const response = await api.patch(`/v1/admin/coupons/${id}/toggle-status`);
    return response.data;
  },

  // DELETE: Remove coupon
  delete: async (id) => {
    const response = await api.delete(`/v1/admin/coupons/${id}`);
    return response.data;
  },
};
