import axiosInstance from "./axiosInstance";

// Helper: Convert URL to Blob for re-uploading existing files (maintains index alignment)
const urlToBlob = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Failed to fetch resource from URL:", url, error);
    return null;
  }
};

const courseService = {
  // ==========================================
  // 1. CORE READ OPERATIONS
  // ==========================================

  getAll: async (params = {}) => {
    const response = await axiosInstance.get("/admin/courses", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/courses/${id}`);
    return response.data;
  },

  // ==========================================
  // 2. CREATE COURSE (Matches Backend: createFullCourse)
  // ==========================================
  createFull: async (courseData) => {
    console.log("🚀 Service: createFull payload:", courseData);
    const formData = new FormData();

    // 1. Basic Fields
    const basicFields = [
      "contentType",
      "name",
      "originalPrice",
      "discountPrice",
      "discountPercent",
      "courseType",
      "startDate",
      "pricingNote",
      "shortDescription",
      "detailedDescription",
      "accessType",
      "isActive",
    ];

    basicFields.forEach((field) => {
      if (courseData[field] !== undefined && courseData[field] !== null) {
        formData.append(field, courseData[field]);
      }
    });

    // 2. Simple Arrays (Must be JSON strings for Backend JSON.parse)
    const arrayFields = [
      "categoryIds",
      "subCategoryIds",
      "languageIds",
      "validityIds",
    ];
    arrayFields.forEach((field) => {
      if (courseData[field]) {
        formData.append(field, JSON.stringify(courseData[field]));
      }
    });

    // 3. Complex Arrays (Metadata as JSON strings)
    // Tutors
    const tutorsData = (courseData.tutors || []).map((t) => ({
      name: t.name,
      subject: t.subject,
      qualification: t.qualification,
    }));
    formData.append("tutors", JSON.stringify(tutorsData));

    // Classes
    const classesData = (courseData.classes || []).map((c) => ({
      title: c.title,
      topic: c.topic,
      order: c.order,
      isFree: c.isFree,
    }));
    formData.append("classes", JSON.stringify(classesData));

    // Study Materials
    const materialsData = (courseData.studyMaterials || []).map((m) => ({
      title: m.title,
      description: m.description,
    }));
    formData.append("studyMaterials", JSON.stringify(materialsData));

    // 4. File Uploads

    // Main Thumbnail
    if (courseData.thumbnail instanceof File) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    // Tutor Images
    if (courseData.tutors) {
      courseData.tutors.forEach((t) => {
        if (t.photo instanceof File) formData.append("tutorImages", t.photo);
      });
    }

    // Class Media
    if (courseData.classes) {
      courseData.classes.forEach((c) => {
        if (c.thumbnail instanceof File)
          formData.append("classThumbnails", c.thumbnail);
        if (c.lecturePhoto instanceof File)
          formData.append("classLecturePics", c.lecturePhoto);
        if (c.video instanceof File) formData.append("classVideos", c.video);
      });
    }

    // Study Material Files
    if (courseData.studyMaterials) {
      courseData.studyMaterials.forEach((m) => {
        if (m.file instanceof File)
          formData.append("studyMaterialFiles", m.file);
      });
    }

    const response = await axiosInstance.post("/admin/courses/full", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ==========================================
  // 3. UPDATE COURSE (Matches Backend: updateCourse)
  // ==========================================
  update: async (id, courseData) => {
    console.log("🚀 Service: update called for ID:", id);
    const formData = new FormData();

    // 1. Construct the Clean JSON Object
    // We send this as a single 'course' string. The backend checks `if (req.body.course)`
    // and parses it. This prevents the 500 error regarding array/string mismatches.
    const payload = {
      contentType: courseData.contentType,
      name: courseData.name,
      courseType: courseData.courseType,
      startDate: courseData.startDate,
      originalPrice: courseData.originalPrice,
      discountPrice: courseData.discountPrice,
      discountPercent: courseData.discountPercent,
      pricingNote: courseData.pricingNote,
      shortDescription: courseData.shortDescription,
      detailedDescription: courseData.detailedDescription,
      isActive: courseData.isActive,
      accessType: courseData.accessType,

      // IDs
      categoryIds: courseData.categoryIds || [],
      subCategoryIds: courseData.subCategoryIds || [],
      languageIds: courseData.languageIds || [],
      validityIds: courseData.validityIds || [],

      // Nested Objects (Include _id to ensure updates instead of creates)
      tutors: (courseData.tutors || []).map((t) => ({
        _id: t._id,
        name: t.name,
        subject: t.subject,
        qualification: t.qualification,
        photoUrl: t.photoUrl,
      })),
      classes: (courseData.classes || []).map((c) => ({
        _id: c._id,
        title: c.title,
        topic: c.topic,
        order: c.order,
        isFree: c.isFree,
        thumbnailUrl: c.thumbnailUrl,
        lecturePhotoUrl: c.lecturePhotoUrl,
        videoUrl: c.videoUrl,
      })),
      studyMaterials: (courseData.studyMaterials || []).map((m) => ({
        _id: m._id,
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl,
      })),
    };

    // Append the JSON payload
    formData.append("course", JSON.stringify(payload));

    // 2. Append Files (Standard Multer handling)
    if (courseData.thumbnail instanceof File) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    // CRITICAL: Tutor images MUST be sent at correct array positions
    // Backend matches by index: tutorImages[0] -> tutors[0], tutorImages[1] -> tutors[1]
    if (courseData.tutors) {
      for (const tutor of courseData.tutors) {
        if (tutor.photo instanceof File) {
          // New photo uploaded
          formData.append("tutorImages", tutor.photo);
        } else if (tutor.photoUrl) {
          // Re-send existing photo to maintain index alignment
          try {
            const blob = await urlToBlob(tutor.photoUrl);
            if (blob) {
              formData.append("tutorImages", blob, "existing.jpg");
            } else {
              // If fetch fails, send a tiny placeholder to maintain position
              formData.append(
                "tutorImages",
                new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
                "placeholder.jpg",
              );
            }
          } catch (error) {
            console.error("Failed to re-upload existing tutor photo:", error);
            // Send placeholder to maintain index
            formData.append(
              "tutorImages",
              new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
              "placeholder.jpg",
            );
          }
        } else {
          // No photo at all, send minimal placeholder
          formData.append(
            "tutorImages",
            new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
            "no-photo.jpg",
          );
        }
      }
    }

    // CRITICAL: Class media files MUST be sent at correct array positions
    // Backend matches by index: classThumbnails[0] -> classes[0], etc.
    if (courseData.classes) {
      for (const cls of courseData.classes) {
        // Thumbnail
        if (cls.thumbnail instanceof File) {
          formData.append("classThumbnails", cls.thumbnail);
        } else if (cls.thumbnailUrl) {
          try {
            const blob = await urlToBlob(cls.thumbnailUrl);
            formData.append(
              "classThumbnails",
              blob || new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
              "existing-thumb.jpg",
            );
          } catch (error) {
            formData.append(
              "classThumbnails",
              new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
              "placeholder-thumb.jpg",
            );
          }
        } else {
          formData.append(
            "classThumbnails",
            new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
            "no-thumb.jpg",
          );
        }

        // Lecture Photo
        if (cls.lecturePhoto instanceof File) {
          formData.append("classLecturePics", cls.lecturePhoto);
        } else if (cls.lecturePhotoUrl) {
          try {
            const blob = await urlToBlob(cls.lecturePhotoUrl);
            formData.append(
              "classLecturePics",
              blob || new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
              "existing-lecture.jpg",
            );
          } catch (error) {
            formData.append(
              "classLecturePics",
              new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
              "placeholder-lecture.jpg",
            );
          }
        } else {
          formData.append(
            "classLecturePics",
            new Blob([new Uint8Array(1)], { type: "image/jpeg" }),
            "no-lecture.jpg",
          );
        }

        // Video
        if (cls.video instanceof File) {
          formData.append("classVideos", cls.video);
        } else if (cls.videoUrl) {
          try {
            const blob = await urlToBlob(cls.videoUrl);
            formData.append(
              "classVideos",
              blob || new Blob([new Uint8Array(1)], { type: "video/mp4" }),
              "existing-video.mp4",
            );
          } catch (error) {
            formData.append(
              "classVideos",
              new Blob([new Uint8Array(1)], { type: "video/mp4" }),
              "placeholder-video.mp4",
            );
          }
        } else {
          formData.append(
            "classVideos",
            new Blob([new Uint8Array(1)], { type: "video/mp4" }),
            "no-video.mp4",
          );
        }
      }
    }

    if (courseData.studyMaterials) {
      courseData.studyMaterials.forEach((m) => {
        if (m.file instanceof File)
          formData.append("studyMaterialFiles", m.file);
      });
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

  // ==========================================
  // 4. UTILS & STATUS
  // ==========================================

  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/courses/${id}`);
    return response.data;
  },

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

  // ==========================================
  // 5. SUB-ENTITY HELPERS (If used individually)
  // ==========================================

  createCourseShell: async (data) => {
    const formData = new FormData();
    if (data.contentType) formData.append("contentType", data.contentType);
    if (data.startDate) formData.append("startDate", data.startDate);
    if (data.categoryIds)
      formData.append("categoryIds", JSON.stringify(data.categoryIds));
    if (data.subCategoryIds)
      formData.append("subCategoryIds", JSON.stringify(data.subCategoryIds));
    if (data.thumbnail instanceof File)
      formData.append("thumbnail", data.thumbnail);
    const response = await axiosInstance.post("/admin/courses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCourseShell: async (id, data) => {
    const formData = new FormData();
    if (data.contentType) formData.append("contentType", data.contentType);
    if (data.startDate) formData.append("startDate", data.startDate);
    if (data.categoryIds)
      formData.append("categoryIds", JSON.stringify(data.categoryIds));
    if (data.subCategoryIds)
      formData.append("subCategoryIds", JSON.stringify(data.subCategoryIds));
    const response = await axiosInstance.put(`/admin/courses/${id}`, formData); // backend uses upload.none()
    return response.data;
  },

  updateCourseBasic: async (id, data) => {
    const formData = new FormData();
    const fields = ["name", "courseType", "originalPrice", "discountPrice"];
    fields.forEach((k) => {
      if (data[k] !== undefined) formData.append(k, data[k]);
    });
    if (data.languageIds)
      formData.append("languageIds", JSON.stringify(data.languageIds));
    if (data.validityIds)
      formData.append("validityIds", JSON.stringify(data.validityIds));
    if (data.thumbnail instanceof File)
      formData.append("thumbnail", data.thumbnail);
    const response = await axiosInstance.put(
      `/admin/courses/${id}/basics`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  updateCourseContent: async (id, data) => {
    const formData = new FormData();
    ["shortDescription", "detailedDescription", "pricingNote"].forEach((k) => {
      if (data[k]) formData.append(k, data[k]);
    });
    if (data.studyMaterials)
      formData.append("studyMaterials", JSON.stringify(data.studyMaterials));
    if (data.studyMaterialFiles) {
      data.studyMaterialFiles.forEach((f) => {
        if (f instanceof File) formData.append("studyMaterialFiles", f);
      });
    }
    const response = await axiosInstance.put(
      `/admin/courses/${id}/content`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  updateDescriptions: async (id, data) => {
    const response = await axiosInstance.put(
      `/admin/courses/${id}/descriptions`,
      data,
    );
    return response.data;
  },

  // Tutors
  addTutors: async (id, tutors, tutorImages = []) => {
    const formData = new FormData();
    formData.append("tutors", JSON.stringify(tutors));
    tutorImages.forEach((f) => {
      if (f instanceof File) formData.append("tutorImages", f);
    });
    const response = await axiosInstance.post(
      `/admin/courses/${id}/tutors`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
  updateTutor: async (cId, tId, data) => {
    const formData = new FormData();
    ["name", "qualification", "subject"].forEach((k) => {
      if (data[k]) formData.append(k, data[k]);
    });
    if (data.photo instanceof File) formData.append("tutorImage", data.photo);
    const response = await axiosInstance.put(
      `/admin/courses/${cId}/tutors/${tId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
  deleteTutor: async (cId, tId) =>
    (await axiosInstance.delete(`/admin/courses/${cId}/tutors/${tId}`)).data,

  // Classes
  addClasses: async (id, classes, classMedia = {}) => {
    const formData = new FormData();
    formData.append("classes", JSON.stringify(classes));
    if (classMedia.thumbnails)
      classMedia.thumbnails.forEach((f) =>
        formData.append("classThumbnails", f),
      );
    if (classMedia.lecturePics)
      classMedia.lecturePics.forEach((f) =>
        formData.append("classLecturePics", f),
      );
    if (classMedia.videos)
      classMedia.videos.forEach((f) => formData.append("classVideos", f));
    const response = await axiosInstance.post(
      `/admin/courses/${id}/classes`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
  updateClass: async (cId, classId, data) => {
    const formData = new FormData();
    ["title", "topic", "order", "isFree"].forEach((k) => {
      if (data[k] !== undefined) formData.append(k, data[k]);
    });
    if (data.thumbnail instanceof File)
      formData.append("classThumbnail", data.thumbnail);
    if (data.lecturePhoto instanceof File)
      formData.append("classLecturePic", data.lecturePhoto);
    if (data.video instanceof File) formData.append("classVideo", data.video);
    const response = await axiosInstance.put(
      `/admin/courses/${cId}/classes/${classId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
  deleteClass: async (cId, classId) =>
    (await axiosInstance.delete(`/admin/courses/${cId}/classes/${classId}`))
      .data,
  uploadClassMedia: async (cId, classId, files) => {
    const formData = new FormData();
    if (files.thumbnail) formData.append("thumbnail", files.thumbnail);
    if (files.lecturePhoto) formData.append("lecturePhoto", files.lecturePhoto);
    if (files.video) formData.append("video", files.video);
    const response = await axiosInstance.put(
      `/admin/courses/${cId}/classes/${classId}/media`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
  deleteStudyMaterial: async (cId, mId) =>
    (await axiosInstance.delete(`/admin/courses/${cId}/study-materials/${mId}`))
      .data,
};

export default courseService;
