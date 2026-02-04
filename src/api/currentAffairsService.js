import axiosInstance from "./axiosInstance";

const currentAffairsService = {
  // --- CONTENT ENDPOINTS ---
  getAll: async (params) => {
    const response = await axiosInstance.get("/admin/current-affairs", {
      params,
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/current-affairs/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await axiosInstance.post(
      "/admin/current-affairs",
      formData,
    );
    return response.data;
  },
  update: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/current-affairs/${id}`,
      formData,
    );
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/current-affairs/${id}`);
    return response.data;
  },

  // --- TYPE (CATEGORY) ENDPOINTS ---
  // These manage "International", "Sports", "State" types
  getTypes: async (params) => {
    const response = await axiosInstance.get(
      "/admin/current-affairs-categories",
      { params },
    );
    return response.data;
  },
  createType: async (formData) => {
    const response = await axiosInstance.post(
      "/admin/current-affairs-categories",
      formData,
    );
    return response.data;
  },
  updateType: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/current-affairs-categories/${id}`,
      formData,
    );
    return response.data;
  },
  deleteType: async (id) => {
    const response = await axiosInstance.delete(
      `/admin/current-affairs-categories/${id}`,
    );
    return response.data;
  },
  toggleTypeStatus: async (id, isActive) => {
    const response = await axiosInstance.patch(
      `/admin/current-affairs-categories/${id}/toggle-status`,
      { isActive },
    );
    return response.data;
  },
  getTypeById: async (id) => {
    const response = await axiosInstance.get(
      `/admin/current-affairs-categories/${id}`,
    );
    return response.data;
  },

  // --- FILTER ENDPOINTS ---
  // Get distinct exam categories used in current affairs
  getFilterCategories: async () => {
    const response = await axiosInstance.get(
      "/admin/current-affairs/filters/categories",
    );
    return response.data;
  },
  // Get distinct subcategories based on category and language
  getFilterSubCategories: async (params) => {
    const response = await axiosInstance.get(
      "/admin/current-affairs/filters/subcategories",
      { params },
    );
    return response.data;
  },
};

export default currentAffairsService;
