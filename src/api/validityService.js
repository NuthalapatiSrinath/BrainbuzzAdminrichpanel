import axiosInstance from "./axiosInstance";

const validityService = {
  getAll: async () => {
    // ✅ Changed /validity to /validities
    const response = await axiosInstance.get("/admin/validities");
    return response.data;
  },
  create: async (data) => {
    // ✅ Changed /validity to /validities
    const response = await axiosInstance.post("/admin/validities", data);
    return response.data;
  },
  update: async (id, data) => {
    // ✅ Changed /validity to /validities
    const response = await axiosInstance.put(`/admin/validities/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    // ✅ Changed /validity to /validities
    const response = await axiosInstance.delete(`/admin/validities/${id}`);
    return response.data;
  },
};

export default validityService;
