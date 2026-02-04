import axiosInstance from "./axiosInstance";

// Helper to build FormData for file uploads
const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

const categoryService = {
  // ✅ FIX: URL changed to /admin/categories
  getAll: async (contentType, isActive) => {
    const params = { contentType };
    if (isActive !== undefined) params.isActive = isActive;

    const response = await axiosInstance.get("/admin/categories", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const formData = createFormData(data);
    const response = await axiosInstance.post("/admin/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id, data) => {
    const formData = createFormData(data);
    const response = await axiosInstance.put(
      `/admin/categories/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
