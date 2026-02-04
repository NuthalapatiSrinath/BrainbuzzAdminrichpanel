import axiosInstance from "./axiosInstance";

const examService = {
  getAll: async () => {
    const response = await axiosInstance.get("/admin/exams");
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post("/admin/exams", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/exams/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/exams/${id}`);
    return response.data;
  },
};

// ✅ CRITICAL: This line fixes your SyntaxError
export default examService;
