import axiosInstance from "./axiosInstance";

const subjectService = {
  getAll: async () => {
    const response = await axiosInstance.get("/admin/subjects");
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post("/admin/subjects", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/subjects/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/subjects/${id}`);
    return response.data;
  },
};

// ✅ CRITICAL: This line fixes the error
export default subjectService;
