import axiosInstance from "./axiosInstance";

const dailyQuizService = {
  // Get all daily quizzes (with optional filters)
  getAll: async (params) => {
    const response = await axiosInstance.get("/admin/daily-quizzes", {
      params,
    });
    return response.data;
  },

  // Get single daily quiz by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/daily-quizzes/${id}`);
    return response.data;
  },

  // Create new daily quiz
  create: async (data) => {
    const response = await axiosInstance.post("/admin/daily-quizzes", data);
    return response.data;
  },

  // Update daily quiz
  update: async (id, data) => {
    const response = await axiosInstance.patch(
      `/admin/daily-quizzes/${id}`,
      data,
    );
    return response.data;
  },

  // Delete daily quiz
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/daily-quizzes/${id}`);
    return response.data;
  },

  // Add question to quiz
  addQuestion: async (quizId, data) => {
    const response = await axiosInstance.post(
      `/admin/daily-quizzes/${quizId}/questions`,
      data,
    );
    return response.data;
  },

  // Update specific question
  updateQuestion: async (quizId, questionId, data) => {
    const response = await axiosInstance.patch(
      `/admin/daily-quizzes/${quizId}/questions/${questionId}`,
      data,
    );
    return response.data;
  },

  // Delete specific question
  deleteQuestion: async (quizId, questionId) => {
    const response = await axiosInstance.delete(
      `/admin/daily-quizzes/${quizId}/questions/${questionId}`,
    );
    return response.data;
  },

  // Get filter categories
  getFilterCategories: async () => {
    const response = await axiosInstance.get(
      "/admin/daily-quizzes/filters/categories",
    );
    return response.data;
  },

  // Get filter subcategories
  getFilterSubCategories: async (params) => {
    const response = await axiosInstance.get(
      "/admin/daily-quizzes/filters/subcategories",
      { params },
    );
    return response.data;
  },
};

export default dailyQuizService;
