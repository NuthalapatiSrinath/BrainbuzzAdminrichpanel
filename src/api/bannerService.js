import api from "./axiosInstance";

export const bannerService = {
  get: async (pageType) => {
    const response = await api.get(`/admin/banners/${pageType}`);
    return response.data;
  },

  // Main Upsert (Text, Styles, Feature Cards)
  upsert: async (formData) => {
    const response = await api.post("/admin/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Add NEW images to existing set (Append)
  addImages: async (formData) => {
    const response = await api.post("/admin/banners/add-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Replace ONE specific image
  updateImage: async (pageType, imageId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.put(
      `/admin/banners/${pageType}/images/${imageId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // Delete ONE specific image
  deleteImage: async (pageType, imageId) => {
    const response = await api.delete(
      `/admin/banners/${pageType}/images/${imageId}`,
    );
    return response.data;
  },

  delete: async (pageType) => {
    const response = await api.delete(`/admin/banners/${pageType}`);
    return response.data;
  },
};
