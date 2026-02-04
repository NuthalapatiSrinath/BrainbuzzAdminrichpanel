import axiosInstance from "./axiosInstance";

const liveClassService = {
  // Get all live classes (supports filters)
  getAll: async (params) => {
    const response = await axiosInstance.get("/admin/live-classes", { params });
    return response.data;
  },

  // Get single by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/live-classes/${id}`);
    return response.data;
  },

  // Create (Multipart)
  create: async (formData) => {
    const response = await axiosInstance.post("/admin/live-classes", formData);
    return response.data;
  },

  // Update (Multipart - PUT based on your backend)
  update: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/live-classes/${id}`,
      formData,
    );
    return response.data;
  },

  // Delete
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/live-classes/${id}`);
    return response.data;
  },

  // Toggle Status
  toggleStatus: async (id, isActive) => {
    // Backend expects 'isActive' in body (JSON or Form)
    const response = await axiosInstance.patch(
      `/admin/live-classes/${id}/status`,
      { isActive },
    );
    return response.data;
  },
};

export default liveClassService;
