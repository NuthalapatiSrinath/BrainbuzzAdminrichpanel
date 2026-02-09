import api from "./axiosInstance";

// Matches the route in app.js: app.use('/api/admin/previous-question-papers', adminPYQRoutes);
const BASE_URL = "/admin/previous-question-papers";

export const pyqService = {
  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Get all PYQs with optional filters
   * URL: GET /api/admin/previous-question-papers
   */
  getAll: async (params) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get a single PYQ by ID
   * URL: GET /api/admin/previous-question-papers/:id
   */
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new PYQ
   * URL: POST /api/admin/previous-question-papers
   * Payload: multipart/form-data with 'pyq' (JSON string) + files
   */
  create: async (data) => {
    const formData = new FormData();

    // 1. Append Files (matches uploadMiddleware in backend routes)
    if (data.thumbnailFile) {
      formData.append("thumbnail", data.thumbnailFile);
    }
    if (data.paperFile) {
      formData.append("paper", data.paperFile);
    }

    // 2. Prepare JSON Payload
    // Exclude file objects from the JSON data to avoid circular reference errors
    const { thumbnailFile, paperFile, ...rest } = data;

    // 3. Append JSON data as a stringified field named 'pyq'
    // (Required by backend: const pyqData = JSON.parse(req.body.pyq))
    formData.append("pyq", JSON.stringify(rest));

    const response = await api.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Update an existing PYQ
   * URL: PUT /api/admin/previous-question-papers/:id
   */
  update: async (id, data) => {
    const formData = new FormData();

    // 1. Append Files if they exist
    if (data.thumbnailFile) {
      formData.append("thumbnail", data.thumbnailFile);
    }
    if (data.paperFile) {
      formData.append("paper", data.paperFile);
    }

    // 2. Prepare JSON Payload
    const { thumbnailFile, paperFile, ...rest } = data;

    // 3. Append JSON data
    formData.append("pyq", JSON.stringify(rest));

    const response = await api.put(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Delete a PYQ
   * URL: DELETE /api/admin/previous-question-papers/:id
   */
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // ==========================================
  // DEDICATED UPDATE METHODS FOR MODALS
  // ==========================================

  /**
   * Update Basic Info (dedicated method for BasicInfoModal)
   * Fields: paperCategory, date, examDate, description
   */
  updateBasicInfo: async (id, data) => {
    const payload = {
      paperCategory: data.paperCategory,
      date: data.date,
      examDate: data.examDate,
      description: data.description,
    };
    const response = await api.put(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  /**
   * Update Classification (dedicated method for ClassificationModal)
   * Fields: categoryId, subCategoryId, examId, subjectId
   */
  updateClassification: async (id, data) => {
    const payload = {
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      examId: data.examId,
      subjectId: data.subjectId,
    };
    const response = await api.put(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  /**
   * Update Thumbnail (dedicated method for FilesModal)
   */
  updateThumbnail: async (id, thumbnailFile) => {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);
    const response = await api.put(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Update Paper (dedicated method for FilesModal)
   */
  updatePaper: async (id, paperFile) => {
    const formData = new FormData();
    formData.append("paper", paperFile);
    const response = await api.put(`${BASE_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ==========================================
  // FILTERS (Based on app.js filter routes)
  // ==========================================

  /**
   * Get Categories for Filter Dropdown
   * URL: GET /api/admin/previous-question-papers/filters/categories
   */
  getCategories: async () => {
    const response = await api.get(`${BASE_URL}/filters/categories`);
    return response.data;
  },

  /**
   * Get SubCategories for Filter Dropdown
   * URL: GET /api/admin/previous-question-papers/filters/subcategories
   */
  getSubCategories: async (categoryId) => {
    const params = categoryId ? { category: categoryId } : {};
    const response = await api.get(`${BASE_URL}/filters/subcategories`, {
      params,
    });
    return response.data;
  },
};
