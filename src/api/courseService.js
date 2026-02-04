import axiosInstance from "./axiosInstance";

const courseService = {
  // Get all courses with filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get("/admin/courses", { params });
    return response.data;
  },

  // Get single course by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/courses/${id}`);
    return response.data;
  },

  // Create complete course in one API call
  createFull: async (courseData) => {
    const formData = new FormData();

    // Basic fields
    formData.append("contentType", courseData.contentType || "ONLINE_COURSE");
    formData.append("name", courseData.name);
    formData.append("originalPrice", courseData.originalPrice);
    if (courseData.discountPrice)
      formData.append("discountPrice", courseData.discountPrice);
    if (courseData.courseType)
      formData.append("courseType", courseData.courseType);
    if (courseData.startDate)
      formData.append("startDate", courseData.startDate);
    if (courseData.pricingNote)
      formData.append("pricingNote", courseData.pricingNote);
    if (courseData.shortDescription)
      formData.append("shortDescription", courseData.shortDescription);
    if (courseData.detailedDescription)
      formData.append("detailedDescription", courseData.detailedDescription);
    if (courseData.accessType)
      formData.append("accessType", courseData.accessType);
    formData.append(
      "isActive",
      courseData.isActive !== undefined ? courseData.isActive : true,
    );

    // Array fields as JSON strings
    formData.append(
      "categoryIds",
      JSON.stringify(courseData.categoryIds || []),
    );
    formData.append(
      "subCategoryIds",
      JSON.stringify(courseData.subCategoryIds || []),
    );
    formData.append(
      "languageIds",
      JSON.stringify(courseData.languageIds || []),
    );
    formData.append(
      "validityIds",
      JSON.stringify(courseData.validityIds || []),
    );

    // Tutors (without photos)
    const tutorsData = (courseData.tutors || []).map((t) => ({
      name: t.name,
      subject: t.subject,
      qualification: t.qualification,
    }));
    formData.append("tutors", JSON.stringify(tutorsData));

    // Classes (without media)
    const classesData = (courseData.classes || []).map((c) => ({
      title: c.title,
      topic: c.topic,
      order: c.order,
      isFree: c.isFree,
    }));
    formData.append("classes", JSON.stringify(classesData));

    // Study materials (without files)
    const materialsData = (courseData.studyMaterials || []).map((m) => ({
      title: m.title,
      description: m.description,
    }));
    formData.append("studyMaterials", JSON.stringify(materialsData));

    // Main thumbnail
    if (courseData.thumbnail) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    // Tutor images (must match order of tutors array)
    (courseData.tutors || []).forEach((tutor) => {
      if (tutor.photo) {
        formData.append("tutorImages", tutor.photo);
      }
    });

    // Class media (must match order of classes array)
    (courseData.classes || []).forEach((cls) => {
      if (cls.video) formData.append("classVideos", cls.video);
      if (cls.thumbnail) formData.append("classThumbnails", cls.thumbnail);
      if (cls.lecturePhoto)
        formData.append("classLecturePics", cls.lecturePhoto);
    });

    // Study material files (must match order of studyMaterials array)
    (courseData.studyMaterials || []).forEach((material) => {
      if (material.file) {
        formData.append("studyMaterialFiles", material.file);
      }
    });

    const response = await axiosInstance.post("/admin/courses/full", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update course (all-in-one)
  update: async (id, courseData) => {
    const formData = new FormData();

    // Basic fields
    if (courseData.contentType)
      formData.append("contentType", courseData.contentType);
    if (courseData.accessType)
      formData.append("accessType", courseData.accessType);
    if (courseData.name) formData.append("name", courseData.name);
    if (courseData.originalPrice !== undefined)
      formData.append("originalPrice", courseData.originalPrice);
    if (courseData.discountPrice !== undefined)
      formData.append("discountPrice", courseData.discountPrice);
    if (courseData.courseType)
      formData.append("courseType", courseData.courseType);
    if (courseData.startDate)
      formData.append("startDate", courseData.startDate);
    if (courseData.pricingNote)
      formData.append("pricingNote", courseData.pricingNote);
    if (courseData.shortDescription)
      formData.append("shortDescription", courseData.shortDescription);
    if (courseData.detailedDescription)
      formData.append("detailedDescription", courseData.detailedDescription);
    if (courseData.isActive !== undefined)
      formData.append("isActive", courseData.isActive);

    // Array fields
    if (courseData.categoryIds)
      formData.append("categoryIds", JSON.stringify(courseData.categoryIds));
    if (courseData.subCategoryIds)
      formData.append(
        "subCategoryIds",
        JSON.stringify(courseData.subCategoryIds),
      );
    if (courseData.languageIds)
      formData.append("languageIds", JSON.stringify(courseData.languageIds));
    if (courseData.validityIds)
      formData.append("validityIds", JSON.stringify(courseData.validityIds));

    // Tutors
    if (courseData.tutors) {
      const tutorsData = courseData.tutors.map((t) => ({
        name: t.name,
        subject: t.subject,
        qualification: t.qualification,
        photoUrl: t.photoUrl, // Keep existing URL if not changing
      }));
      formData.append("tutors", JSON.stringify(tutorsData));

      courseData.tutors.forEach((tutor) => {
        if (tutor.photo instanceof File) {
          formData.append("tutorImages", tutor.photo);
        }
      });
    }

    // Classes
    if (courseData.classes) {
      const classesData = courseData.classes.map((c) => ({
        title: c.title,
        topic: c.topic,
        order: c.order,
        isFree: c.isFree,
        thumbnailUrl: c.thumbnailUrl, // Keep existing URLs
        lecturePhotoUrl: c.lecturePhotoUrl,
        videoUrl: c.videoUrl,
      }));
      formData.append("classes", JSON.stringify(classesData));

      courseData.classes.forEach((cls) => {
        if (cls.video instanceof File)
          formData.append("classVideos", cls.video);
        if (cls.thumbnail instanceof File)
          formData.append("classThumbnails", cls.thumbnail);
        if (cls.lecturePhoto instanceof File)
          formData.append("classLecturePics", cls.lecturePhoto);
      });
    }

    // Study materials
    if (courseData.studyMaterials) {
      const materialsData = courseData.studyMaterials.map((m) => ({
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl, // Keep existing URL
      }));
      formData.append("studyMaterials", JSON.stringify(materialsData));

      courseData.studyMaterials.forEach((material) => {
        if (material.file instanceof File) {
          formData.append("studyMaterialFiles", material.file);
        }
      });
    }

    // Thumbnail
    if (courseData.thumbnail instanceof File) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    const response = await axiosInstance.patch(
      `/admin/courses/${id}/all-in-one`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Delete course
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Publish/Unpublish
  publish: async (id) => {
    const response = await axiosInstance.patch(`/admin/courses/${id}/publish`);
    return response.data;
  },

  unpublish: async (id) => {
    const response = await axiosInstance.patch(
      `/admin/courses/${id}/unpublish`,
    );
    return response.data;
  },
};

export default courseService;
