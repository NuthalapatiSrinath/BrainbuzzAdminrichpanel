import axiosInstance from "./axiosInstance";

const publicationService = {
  // Get all (with optional filters)
  getAll: async (params) => {
    const response = await axiosInstance.get("/admin/publications", { params });
    return response.data;
  },

  // Get single by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/publications/${id}`);
    return response.data;
  },

  // Create (Multipart)
  create: async (formData) => {
    const response = await axiosInstance.post("/admin/publications", formData);
    return response.data;
  },

  // Main Update (Patch)
  update: async (id, data) => {
    // 'data' can be JSON or FormData depending on what we send.
    // Your backend for PATCH /:id uses upload.none(), so JSON is fine for text fields.
    const response = await axiosInstance.patch(
      `/admin/publications/${id}`,
      data,
    );
    return response.data;
  },

  // Delete
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/publications/${id}`);
    return response.data;
  },

  // --- Sub-resource Routes ---

  // Authors
  addAuthor: async (id, formData) => {
    const response = await axiosInstance.post(
      `/admin/publications/${id}/authors`,
      formData,
    );
    return response.data;
  },
  updateAuthor: async (id, authorId, formData) => {
    const response = await axiosInstance.put(
      `/admin/publications/${id}/authors/${authorId}`,
      formData,
    );
    return response.data;
  },
  deleteAuthor: async (id, authorId) => {
    const response = await axiosInstance.delete(
      `/admin/publications/${id}/authors/${authorId}`,
    );
    return response.data;
  },

  // Gallery Images
  addImage: async (id, formData) => {
    const response = await axiosInstance.post(
      `/admin/publications/${id}/images`,
      formData,
    );
    return response.data;
  },
  removeImage: async (id, imageUrl) => {
    // DELETE requests with body need 'data' key in axios
    const response = await axiosInstance.delete(
      `/admin/publications/${id}/images`,
      { data: { imageUrl } },
    );
    return response.data;
  },

  // Specific File Updates
  updateBook: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/publications/${id}/book`,
      formData,
    );
    return response.data;
  },
  updateThumbnail: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/publications/${id}/thumbnail`,
      formData,
    );
    return response.data;
  },

  // Update Categories
  updateCategories: async (id, data) => {
    const response = await axiosInstance.put(
      `/admin/publications/${id}/categories`,
      data,
    );
    return response.data;
  },

  // Filter Routes
  getFilterCategories: async () => {
    const response = await axiosInstance.get(
      "/admin/publications/filters/categories",
    );
    return response.data;
  },
  getFilterSubCategories: async (params) => {
    const response = await axiosInstance.get(
      "/admin/publications/filters/subcategories",
      { params },
    );
    return response.data;
  },
};

export default publicationService;
