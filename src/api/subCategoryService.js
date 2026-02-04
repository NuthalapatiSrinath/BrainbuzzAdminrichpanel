import axiosInstance from "./axiosInstance";

const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

const subCategoryService = {
  // ✅ FIX: URL changed to /admin/subcategories
  getAll: async (contentType, categoryId) => {
    const params = { contentType };
    if (categoryId) params.category = categoryId;

    const response = await axiosInstance.get("/admin/subcategories", {
      params,
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/subcategories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const formData = createFormData(data);
    const response = await axiosInstance.post(
      "/admin/subcategories",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  update: async (id, data) => {
    const formData = createFormData(data);
    const response = await axiosInstance.put(
      `/admin/subcategories/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/subcategories/${id}`);
    return response.data;
  },
};

export default subCategoryService;
