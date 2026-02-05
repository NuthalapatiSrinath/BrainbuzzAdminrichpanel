import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import courseService from "../../api/courseService";

// Async thunks
export const fetchCourses = createAsyncThunk(
  "courses/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await courseService.getAll(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses",
      );
    }
  },
);

export const fetchCourseById = createAsyncThunk(
  "courses/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await courseService.getById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course",
      );
    }
  },
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (courseData, { rejectWithValue }) => {
    try {
      return await courseService.createFull(courseData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create course",
      );
    }
  },
);

export const updateCourse = createAsyncThunk(
  "courses/update",
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      return await courseService.update(id, courseData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course",
      );
    }
  },
);

export const deleteCourse = createAsyncThunk(
  "courses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await courseService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete course",
      );
    }
  },
);

export const publishCourse = createAsyncThunk(
  "courses/publish",
  async (id, { rejectWithValue }) => {
    try {
      return await courseService.publish(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to publish course",
      );
    }
  },
);

export const unpublishCourse = createAsyncThunk(
  "courses/unpublish",
  async (id, { rejectWithValue }) => {
    try {
      return await courseService.unpublish(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unpublish course",
      );
    }
  },
);

// Create course shell (draft)
export const createCourseShell = createAsyncThunk(
  "courses/createShell",
  async (data, { rejectWithValue }) => {
    try {
      return await courseService.createCourseShell(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create course shell",
      );
    }
  },
);

// Update course shell
export const updateCourseShell = createAsyncThunk(
  "courses/updateShell",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateCourseShell(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course shell",
      );
    }
  },
);

// Update course basics
export const updateCourseBasic = createAsyncThunk(
  "courses/updateBasic",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateCourseBasic(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course basics",
      );
    }
  },
);

// Update course content
export const updateCourseContent = createAsyncThunk(
  "courses/updateContent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateCourseContent(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course content",
      );
    }
  },
);

// Update course descriptions
export const updateCourseDescriptions = createAsyncThunk(
  "courses/updateDescriptions",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateCourseDescriptions(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update descriptions",
      );
    }
  },
);

// Delete study material
export const deleteStudyMaterial = createAsyncThunk(
  "courses/deleteStudyMaterial",
  async ({ courseId, materialId }, { rejectWithValue }) => {
    try {
      return await courseService.deleteStudyMaterial(courseId, materialId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete study material",
      );
    }
  },
);

// Add tutors
export const addTutors = createAsyncThunk(
  "courses/addTutors",
  async ({ id, tutors, tutorImages }, { rejectWithValue }) => {
    try {
      return await courseService.addTutors(id, tutors, tutorImages);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add tutors",
      );
    }
  },
);

// Update tutor
export const updateTutor = createAsyncThunk(
  "courses/updateTutor",
  async ({ courseId, tutorId, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateTutor(courseId, tutorId, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update tutor",
      );
    }
  },
);

// Delete tutor
export const deleteTutor = createAsyncThunk(
  "courses/deleteTutor",
  async ({ courseId, tutorId }, { rejectWithValue }) => {
    try {
      return await courseService.deleteTutor(courseId, tutorId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete tutor",
      );
    }
  },
);

// Add classes to course
export const addClassesToCourse = createAsyncThunk(
  "courses/addClasses",
  async ({ id, classes, classMedia }, { rejectWithValue }) => {
    try {
      return await courseService.addClassesToCourse(id, classes, classMedia);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add classes",
      );
    }
  },
);

// Update class
export const updateClass = createAsyncThunk(
  "courses/updateClass",
  async ({ courseId, classId, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateClass(courseId, classId, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update class",
      );
    }
  },
);

// Delete class
export const deleteClass = createAsyncThunk(
  "courses/deleteClass",
  async ({ courseId, classId }, { rejectWithValue }) => {
    try {
      return await courseService.deleteClass(courseId, classId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete class",
      );
    }
  },
);

// Upload class media
export const uploadClassMedia = createAsyncThunk(
  "courses/uploadClassMedia",
  async ({ courseId, classId, files }, { rejectWithValue }) => {
    try {
      return await courseService.uploadClassMedia(courseId, classId, files);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload class media",
      );
    }
  },
);

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    selectedCourse: null,
    loading: false,
    error: null,
    totalCourses: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.courses = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.courses = action.payload;
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload.data;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        const newCourse = action.payload.data || action.payload;
        state.courses.unshift(newCourse);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Publish Course
      .addCase(publishCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats: { data: course } or direct course object
        const publishedCourse = action.payload?.data || action.payload;
        if (publishedCourse && publishedCourse._id) {
          const index = state.courses.findIndex(
            (c) => c._id === publishedCourse._id,
          );
          if (index !== -1) {
            // Update the course in the array with the new data
            state.courses[index] = {
              ...state.courses[index],
              ...publishedCourse,
              isActive: true, // Ensure isActive is set to true
            };
          }
        }
      })
      .addCase(publishCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to publish course";
      })

      // Unpublish Course
      .addCase(unpublishCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unpublishCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats: { data: course } or direct course object
        const unpublishedCourse = action.payload?.data || action.payload;
        if (unpublishedCourse && unpublishedCourse._id) {
          const index = state.courses.findIndex(
            (c) => c._id === unpublishedCourse._id,
          );
          if (index !== -1) {
            // Update the course in the array with the new data
            state.courses[index] = {
              ...state.courses[index],
              ...unpublishedCourse,
              isActive: false, // Ensure isActive is set to false
            };
          }
        }
      })
      .addCase(unpublishCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to unpublish course";
      })

      // Create Course Shell
      .addCase(createCourseShell.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourseShell.fulfilled, (state, action) => {
        state.loading = false;
        const newCourse = action.payload.data || action.payload;
        state.courses.unshift(newCourse);
      })
      .addCase(createCourseShell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Course Shell
      .addCase(updateCourseShell.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseShell.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateCourseShell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Course Basic
      .addCase(updateCourseBasic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseBasic.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateCourseBasic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Course Content
      .addCase(updateCourseContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseContent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateCourseContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Course Descriptions
      .addCase(updateCourseDescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseDescriptions.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateCourseDescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Study Material
      .addCase(deleteStudyMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudyMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(deleteStudyMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Tutors
      .addCase(addTutors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTutors.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(addTutors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Tutor
      .addCase(updateTutor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTutor.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateTutor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Tutor
      .addCase(deleteTutor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTutor.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(deleteTutor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Classes to Course
      .addCase(addClassesToCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addClassesToCourse.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(addClassesToCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Class
      .addCase(updateClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Class
      .addCase(deleteClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload Class Media
      .addCase(uploadClassMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadClassMedia.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data || action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === updatedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
      })
      .addCase(uploadClassMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;
