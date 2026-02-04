import axiosInstance from "./axiosInstance";

const eBookService = {
  // Get all (with optional filters)
  getAll: async (params) => {
    const response = await axiosInstance.get("/admin/ebooks", { params });
    return response.data;
  },

  // Get single by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/ebooks/${id}`);
    return response.data;
  },

  // Create (Multipart)
  create: async (formData) => {
    const response = await axiosInstance.post("/admin/ebooks", formData);
    return response.data;
  },

  // Main Update (Patch)
  update: async (id, data) => {
    const response = await axiosInstance.patch(`/admin/ebooks/${id}`, data);
    return response.data;
  },

  // Delete
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/ebooks/${id}`);
    return response.data;
  },

  // --- Sub-resource Routes ---

  // Specific File Updates
  updateBook: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/ebooks/${id}/book`,
      formData,
    );
    return response.data;
  },
  updateThumbnail: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/ebooks/${id}/thumbnail`,
      formData,
    );
    return response.data;
  },

  // Update Categories
  updateCategories: async (id, data) => {
    const response = await axiosInstance.put(
      `/admin/ebooks/${id}/categories`,
      data,
    );
    return response.data;
  },

  // Filter Routes
  getFilterCategories: async () => {
    const response = await axiosInstance.get(
      "/admin/ebooks/filters/categories",
    );
    return response.data;
  },
  getFilterSubCategories: async (params) => {
    const response = await axiosInstance.get(
      "/admin/ebooks/filters/subcategories",
      { params },
    );
    return response.data;
  },
};

export default eBookService;
