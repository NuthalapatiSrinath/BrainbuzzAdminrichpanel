import axiosInstance from "./axiosInstance";

const languageService = {
  getAll: async () => {
    const response = await axiosInstance.get("/admin/languages");
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post("/admin/languages", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/languages/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/languages/${id}`);
    return response.data;
  },
};

export default languageService;
