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

  // Create course shell (Step 1: Draft creation)
  createCourseShell: async (data) => {
    const formData = new FormData();
    if (data.contentType) formData.append("contentType", data.contentType);
    if (data.startDate) formData.append("startDate", data.startDate);
    if (data.categoryIds)
      formData.append("categoryIds", JSON.stringify(data.categoryIds));
    if (data.subCategoryIds)
      formData.append("subCategoryIds", JSON.stringify(data.subCategoryIds));

    const response = await axiosInstance.post("/admin/courses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update course shell (contentType, categories, subcategories, date)
  updateCourseShell: async (id, data) => {
    const formData = new FormData();
    if (data.contentType) formData.append("contentType", data.contentType);
    if (data.startDate) formData.append("startDate", data.startDate);
    if (data.categoryIds)
      formData.append("categoryIds", JSON.stringify(data.categoryIds));
    if (data.subCategoryIds)
      formData.append("subCategoryIds", JSON.stringify(data.subCategoryIds));

    const response = await axiosInstance.put(`/admin/courses/${id}`, formData);
    return response.data;
  },

  // Update course basics (Step 2: name, pricing, languages, validity, thumbnail)
  updateCourseBasic: async (id, data) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.courseType) formData.append("courseType", data.courseType);
    if (data.languageIds)
      formData.append("languageIds", JSON.stringify(data.languageIds));
    if (data.validityIds)
      formData.append("validityIds", JSON.stringify(data.validityIds));
    if (data.originalPrice !== undefined)
      formData.append("originalPrice", data.originalPrice);
    if (data.discountPrice !== undefined)
      formData.append("discountPrice", data.discountPrice);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    const response = await axiosInstance.put(
      `/admin/courses/${id}/basics`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Update course content (Step 3: descriptions, study materials)
  updateCourseContent: async (id, data) => {
    const formData = new FormData();
    if (data.shortDescription)
      formData.append("shortDescription", data.shortDescription);
    if (data.detailedDescription)
      formData.append("detailedDescription", data.detailedDescription);
    if (data.pricingNote) formData.append("pricingNote", data.pricingNote);
    if (data.studyMaterials)
      formData.append("studyMaterials", JSON.stringify(data.studyMaterials));

    // Append study material files
    if (data.studyMaterialFiles && Array.isArray(data.studyMaterialFiles)) {
      data.studyMaterialFiles.forEach((file) => {
        formData.append("studyMaterialFiles", file);
      });
    }

    const response = await axiosInstance.put(
      `/admin/courses/${id}/content`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Update course descriptions only
  updateCourseDescriptions: async (id, data) => {
    const response = await axiosInstance.put(
      `/admin/courses/${id}/descriptions`,
      data,
    );
    return response.data;
  },

  // Delete study material
  deleteStudyMaterial: async (courseId, materialId) => {
    const response = await axiosInstance.delete(
      `/admin/courses/${courseId}/study-materials/${materialId}`,
    );
    return response.data;
  },

  // Add tutors to course
  addTutors: async (id, tutors, tutorImages) => {
    const formData = new FormData();
    formData.append("tutors", JSON.stringify(tutors));

    // Append tutor images (must match tutors array order)
    if (tutorImages && Array.isArray(tutorImages)) {
      tutorImages.forEach((image) => {
        if (image) formData.append("tutorImages", image);
      });
    }

    const response = await axiosInstance.post(
      `/admin/courses/${id}/tutors`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Update single tutor
  updateTutor: async (courseId, tutorId, data) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.qualification)
      formData.append("qualification", data.qualification);
    if (data.subject) formData.append("subject", data.subject);
    if (data.photo) formData.append("tutorImage", data.photo);

    const response = await axiosInstance.put(
      `/admin/courses/${courseId}/tutors/${tutorId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Delete tutor
  deleteTutor: async (courseId, tutorId) => {
    const response = await axiosInstance.delete(
      `/admin/courses/${courseId}/tutors/${tutorId}`,
    );
    return response.data;
  },

  // Add classes to course
  addClassesToCourse: async (id, classes, classMedia) => {
    const formData = new FormData();
    formData.append("classes", JSON.stringify(classes));

    // Append class media (must match classes array order)
    if (classMedia) {
      if (classMedia.thumbnails && Array.isArray(classMedia.thumbnails)) {
        classMedia.thumbnails.forEach((file) => {
          if (file) formData.append("classThumbnails", file);
        });
      }
      if (classMedia.lecturePics && Array.isArray(classMedia.lecturePics)) {
        classMedia.lecturePics.forEach((file) => {
          if (file) formData.append("classLecturePics", file);
        });
      }
      if (classMedia.videos && Array.isArray(classMedia.videos)) {
        classMedia.videos.forEach((file) => {
          if (file) formData.append("classVideos", file);
        });
      }
    }

    const response = await axiosInstance.post(
      `/admin/courses/${id}/classes`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Update single class
  updateClass: async (courseId, classId, data) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.topic) formData.append("topic", data.topic);
    if (data.order !== undefined) formData.append("order", data.order);
    if (data.isFree !== undefined) formData.append("isFree", data.isFree);
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
    if (data.lecturePhoto) formData.append("lecturePhoto", data.lecturePhoto);
    if (data.video) formData.append("video", data.video);

    const response = await axiosInstance.put(
      `/admin/courses/${courseId}/classes/${classId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Delete class
  deleteClass: async (courseId, classId) => {
    const response = await axiosInstance.delete(
      `/admin/courses/${courseId}/classes/${classId}`,
    );
    return response.data;
  },

  // Upload class media (alternative endpoint for media only)
  uploadClassMedia: async (courseId, classId, files) => {
    const formData = new FormData();
    if (files.thumbnail) formData.append("thumbnail", files.thumbnail);
    if (files.lecturePhoto) formData.append("lecturePhoto", files.lecturePhoto);
    if (files.video) formData.append("video", files.video);

    const response = await axiosInstance.put(
      `/admin/courses/${courseId}/classes/${classId}/media`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};

export default courseService;
