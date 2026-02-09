import axiosInstance from "./axiosInstance";

const publicationService = {
  // ==========================================
  // 1. READ OPERATIONS
  // ==========================================

  getAll: async (params = {}) => {
    const response = await axiosInstance.get("/admin/publications", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/publications/${id}`);
    return response.data;
  },

  // ==========================================
  // 2. CREATE (Multipart with JSON Wrapper)
  // ==========================================

  create: async (data) => {
    const formData = new FormData();

    // 1. Construct JSON payload matching Postman body
    const payload = {
      name: data.name,
      startDate: data.startDate,
      categoryIds: data.categoryIds || [],
      subCategoryIds: data.subCategoryIds || [],
      languageIds: data.languageIds || [],
      validityIds: data.validityIds || [],
      originalPrice: Number(data.originalPrice),
      discountPrice: Number(data.discountPrice || 0),
      availableIn: data.availableIn, // 'PUBLICATION', 'HARD_COPY', etc.
      shortDescription: data.shortDescription,
      detailedDescription: data.detailedDescription,
      authors: data.authors || [], // Array of {name, qualification, subject}
      isActive: data.isActive,
      pricingNote: data.pricingNote,
    };

    // Append 'publication' key (Required by Backend)
    formData.append("publication", JSON.stringify(payload));

    // 2. Append Files
    if (data.thumbnail instanceof File) {
      formData.append("thumbnail", data.thumbnail);
    }

    if (data.bookFile instanceof File) {
      formData.append("bookFile", data.bookFile);
    }

    // Append Author Images (Map by index for initial creation)
    if (data.authorImages && data.authors) {
      // authorImages is an object/array like {0: file, 1: file}
      Object.keys(data.authorImages).forEach((index) => {
        const file = data.authorImages[index];
        if (file instanceof File) {
          // Backend controller iterates based on index match
          formData.append("authorImages", file);
        }
      });
    }

    // Append Gallery Images
    if (data.galleryImages && Array.isArray(data.galleryImages)) {
      data.galleryImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("galleryImages", file);
        }
      });
    }

    const response = await axiosInstance.post("/admin/publications", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ==========================================
  // 3. UPDATE METHODS (Granular as per routes)
  // ==========================================

  // PATCH: Basic Info (Text fields only)
  update: async (id, data) => {
    // Backend uses upload.none(), so we send JSON or simple FormData
    // Sending strictly the allowed fields from backend ALLOWED_FIELDS
    const response = await axiosInstance.patch(
      `/admin/publications/${id}`,
      data,
    );
    return response.data;
  },

  // PATCH: Update Basic Info (dedicated method for BasicInfoModal)
  updateBasicInfo: async (id, data) => {
    const payload = {
      name: data.name,
      startDate: data.startDate,
      availableIn: data.availableIn,
      isActive: data.isActive,
      shortDescription: data.shortDescription,
      detailedDescription: data.detailedDescription,
    };
    const response = await axiosInstance.patch(
      `/admin/publications/${id}`,
      payload,
    );
    return response.data;
  },

  // PATCH: Update Pricing (dedicated method for PricingModal)
  updatePricing: async (id, data) => {
    const payload = {
      originalPrice: Number(data.originalPrice),
      discountPrice: data.discountPrice
        ? Number(data.discountPrice)
        : undefined,
      pricingNote: data.pricingNote,
    };
    const response = await axiosInstance.patch(
      `/admin/publications/${id}`,
      payload,
    );
    return response.data;
  },

  // PATCH: Update Classification (dedicated method for ClassificationModal)
  updateClassification: async (id, data) => {
    try {
      // Backend has TWO separate routes with specific field names:
      // 1. PUT /admin/publications/:id/categories - expects 'categories' & 'subCategories'
      // 2. PATCH /admin/publications/:id - expects 'validities'

      // First, update categories and subcategories
      const categoryPayload = {
        categories: data.categoryIds, // Backend expects 'categories' not 'categoryIds'
        subCategories: data.subCategoryIds, // Backend expects 'subCategories' not 'subCategoryIds'
      };

      await axiosInstance.put(
        `/admin/publications/${id}/categories`,
        categoryPayload,
      );

      // Then, update validities
      const validityPayload = {
        validities: data.validityIds, // Backend expects 'validities' not 'validityIds'
      };

      const validityResponse = await axiosInstance.patch(
        `/admin/publications/${id}`,
        validityPayload,
      );

      // Return the latest response which has all populated data
      return validityResponse.data;
    } catch (error) {
      console.error("Classification update error:", error);
      throw error;
    }
  },

  // PUT: Update Book File
  updateBook: async (id, file) => {
    const formData = new FormData();
    formData.append("bookFile", file);
    const response = await axiosInstance.put(
      `/admin/publications/${id}/book`,
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
      `/admin/publications/${id}/thumbnail`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // PUT: Update Categories/Subcategories
  updateCategories: async (id, categoryIds, subCategoryIds) => {
    const formData = new FormData();
    formData.append("categories", categoryIds); // Backend might expect string or array ID
    // If backend expects JSON array string for ids in this route (check controller), use JSON.stringify
    // Based on 'updateCategories' controller: "const { categories, subCategories } = req.body;"
    // It likely accepts direct array if sending JSON, or repeated keys if FormData.
    // Safest bet for PUT with data: JSON body.
    const payload = {
      categories: categoryIds,
      subCategories: subCategoryIds,
    };
    const response = await axiosInstance.put(
      `/admin/publications/${id}/categories`,
      payload,
    );
    return response.data;
  },

  // ==========================================
  // 4. SUB-RESOURCE OPERATIONS (Authors/Images)
  // ==========================================

  // POST: Add Author
  addAuthor: async (id, authorData, photoFile) => {
    const formData = new FormData();
    formData.append("name", authorData.name);
    formData.append("qualification", authorData.qualification || "");
    formData.append("subject", authorData.subject);

    if (photoFile instanceof File) {
      formData.append("authorImage", photoFile);
    }

    const response = await axiosInstance.post(
      `/admin/publications/${id}/authors`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // PUT: Update Author
  updateAuthor: async (id, authorId, authorData, photoFile) => {
    const formData = new FormData();
    if (authorData.name) formData.append("name", authorData.name);
    if (authorData.qualification)
      formData.append("qualification", authorData.qualification);
    if (authorData.subject) formData.append("subject", authorData.subject);

    if (photoFile instanceof File) {
      formData.append("authorImage", photoFile);
    }

    const response = await axiosInstance.put(
      `/admin/publications/${id}/authors/${authorId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // DELETE: Delete Author
  deleteAuthor: async (id, authorId) => {
    const response = await axiosInstance.delete(
      `/admin/publications/${id}/authors/${authorId}`,
    );
    return response.data;
  },

  // POST: Add Gallery Image
  addImage: async (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axiosInstance.post(
      `/admin/publications/${id}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // Alias for addImage (for GalleryModal)
  addGalleryImage: async (id, file) => {
    return publicationService.addImage(id, file);
  },

  // DELETE: Remove Gallery Image
  removeImage: async (id, imageUrl) => {
    // DELETE requests with body need 'data' key in axios config
    const response = await axiosInstance.delete(
      `/admin/publications/${id}/images`,
      { data: { imageUrl } },
    );
    return response.data;
  },

  // Alias for removeImage (for GalleryModal)
  removeGalleryImage: async (id, imageUrl) => {
    return publicationService.removeImage(id, imageUrl);
  },

  // ==========================================
  // 5. DELETE & FILTERS
  // ==========================================

  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/publications/${id}`);
    return response.data;
  },

  // Helpers (if used)
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
