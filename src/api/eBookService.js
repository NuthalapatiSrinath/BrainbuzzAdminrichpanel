import axiosInstance from "./axiosInstance";

const eBookService = {
  // ==========================================
  // 1. READ
  // ==========================================

  getAll: async (params = {}) => {
    const response = await axiosInstance.get("/admin/ebooks", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/ebooks/${id}`);
    return response.data;
  },

  // ==========================================
  // 2. CREATE (Multipart with JSON Wrapper)
  // ==========================================

  create: async (data) => {
    const formData = new FormData();

    // 1. Construct JSON payload for text/array fields
    const payload = {
      name: data.name,
      startDate: data.startDate,
      description: data.description,
      isActive: data.isActive,
      accessType: data.accessType,
      categoryIds: data.categoryIds || [],
      subCategoryIds: data.subCategoryIds || [],
      languageIds: data.languageIds || [],
    };

    // Append JSON string under 'ebook' key (Required by Backend)
    formData.append("ebook", JSON.stringify(payload));

    // 2. Append Files
    if (data.thumbnail instanceof File) {
      formData.append("thumbnail", data.thumbnail);
    }
    if (data.bookFile instanceof File) {
      formData.append("bookFile", data.bookFile);
    }

    const response = await axiosInstance.post("/admin/ebooks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ==========================================
  // 3. UPDATE METHODS (Granular)
  // ==========================================

  // PATCH: Basic Info (Name, Date, Description, Status)
  update: async (id, data) => {
    // Backend expects simple fields. We send JSON.
    const payload = {
      name: data.name,
      startDate: data.startDate,
      description: data.description,
      isActive: data.isActive,
    };
    const response = await axiosInstance.patch(`/admin/ebooks/${id}`, payload);
    return response.data;
  },

  // PUT: Update Book File
  updateBook: async (id, file) => {
    const formData = new FormData();
    formData.append("bookFile", file);
    const response = await axiosInstance.put(
      `/admin/ebooks/${id}/book`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // PUT: Update Thumbnail
  updateThumbnail: async (id, file) => {
    const formData = new FormData();
    formData.append("thumbnail", file);
    const response = await axiosInstance.put(
      `/admin/ebooks/${id}/thumbnail`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // PUT: Update Categories/Subcategories (Language NOT supported by backend)
  updateCategories: async (id, categoryIds, subCategoryIds) => {
    const payload = {
      categories: categoryIds,
      subCategories: subCategoryIds,
      // Note: Backend does NOT support updating languages after creation
    };
    const response = await axiosInstance.put(
      `/admin/ebooks/${id}/categories`,
      payload,
    );
    return response.data;
  },

  // ==========================================
  // 4. DELETE
  // ==========================================

  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/ebooks/${id}`);
    return response.data;
  },

  // ==========================================
  // 5. FILTERS
  // ==========================================
  getFilterCategories: async () => {
    const response = await axiosInstance.get(
      "/admin/ebooks/filters/categories",
    );
    return response.data;
  },

  getFilterSubCategories: async (params) => {
    const response = await axiosInstance.get(
      "/admin/ebooks/filters/subcategories",
      { params },
    );
    return response.data;
  },
};

export default eBookService;
