import axiosInstance from "./axiosInstance";

const testSeriesService = {
  // --- SERIES CRUD ---
  getAll: async (params) => {
    const response = await axiosInstance.get("/admin/test-series", { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/test-series/${id}`);
    return response.data;
  },
  getFullById: async (id) => {
    const response = await axiosInstance.get(`/admin/test-series/${id}/full`);
    return response.data;
  },
  create: async (formData) => {
    const response = await axiosInstance.post("/admin/test-series", formData);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await axiosInstance.put(
      `/admin/test-series/${id}`,
      formData,
    );
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/test-series/${id}`);
    return response.data;
  },

  // --- NESTED TESTS ---
  addTest: async (seriesId, data) => {
    const response = await axiosInstance.post(
      `/admin/test-series/${seriesId}/tests`,
      data,
    );
    return response.data;
  },
  getTest: async (seriesId, testId) => {
    const response = await axiosInstance.get(
      `/admin/test-series/${seriesId}/tests/${testId}`,
    );
    return response.data;
  },
  updateTest: async (seriesId, testId, data) => {
    const response = await axiosInstance.put(
      `/admin/test-series/${seriesId}/tests/${testId}`,
      data,
    );
    return response.data;
  },
  deleteTest: async (seriesId, testId) => {
    const response = await axiosInstance.delete(
      `/admin/test-series/${seriesId}/tests/${testId}`,
    );
    return response.data;
  },

  // --- TEST EXTRAS (Instructions, Video, Cutoff) ---
  updateInstructions: async (seriesId, testId, data) => {
    const response = await axiosInstance.put(
      `/admin/test-series/${seriesId}/tests/${testId}/instructions`,
      data,
    );
    return response.data;
  },
  updateExplanationVideo: async (seriesId, testId, formData) => {
    const response = await axiosInstance.post(
      `/admin/test-series/${seriesId}/tests/${testId}/explanation-video`,
      formData,
    );
    return response.data;
  },

  // Cutoffs
  setCutoff: async (seriesId, testId, data) => {
    const response = await axiosInstance.post(
      `/admin/test-series/${seriesId}/tests/${testId}/cutoff`,
      data,
    );
    return response.data;
  },
  getCutoff: async (seriesId, testId) => {
    try {
      const response = await axiosInstance.get(
        `/admin/test-series/${seriesId}/tests/${testId}/cutoff`,
      );
      return response.data;
    } catch (e) {
      return { data: null };
    } // Handle 404
  },

  // --- SECTIONS ---
  addSection: async (seriesId, testId, data) => {
    const response = await axiosInstance.post(
      `/admin/test-series/${seriesId}/tests/${testId}/sections`,
      data,
    );
    return response.data;
  },
  updateSection: async (seriesId, testId, sectionId, data) => {
    const response = await axiosInstance.put(
      `/admin/test-series/${seriesId}/tests/${testId}/sections/${sectionId}`,
      data,
    );
    return response.data;
  },
  deleteSection: async (seriesId, testId, sectionId) => {
    const response = await axiosInstance.delete(
      `/admin/test-series/${seriesId}/tests/${testId}/sections/${sectionId}`,
    );
    return response.data;
  },

  // --- QUESTIONS ---
  addQuestion: async (seriesId, testId, sectionId, data) => {
    const response = await axiosInstance.post(
      `/admin/test-series/${seriesId}/tests/${testId}/sections/${sectionId}/questions`,
      data,
    );
    return response.data;
  },
  updateQuestion: async (seriesId, testId, sectionId, questionId, data) => {
    const response = await axiosInstance.put(
      `/admin/test-series/${seriesId}/tests/${testId}/sections/${sectionId}/questions/${questionId}`,
      data,
    );
    return response.data;
  },
  deleteQuestion: async (seriesId, testId, sectionId, questionId) => {
    const response = await axiosInstance.delete(
      `/admin/test-series/${seriesId}/tests/${testId}/sections/${sectionId}/questions/${questionId}`,
    );
    return response.data;
  },

  // --- PARTICIPANTS ---
  getParticipants: async (seriesId, testId) => {
    const response = await axiosInstance.get(
      `/admin/test-series/${seriesId}/tests/${testId}/participants`,
    );
    return response.data;
  },

  // --- FILTERS ---
  getFilterCategories: async () => {
    const response = await axiosInstance.get(
      "/admin/test-series/filters/categories",
    );
    return response.data;
  },
  getFilterSubCategories: async (params) => {
    const response = await axiosInstance.get(
      "/admin/test-series/filters/subcategories",
      { params },
    );
    return response.data;
  },
};

export default testSeriesService;
