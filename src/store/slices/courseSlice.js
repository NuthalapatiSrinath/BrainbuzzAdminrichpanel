import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import courseService from "../../api/courseService";

// --- Async Thunks ---

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

// Full Course Creation
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

// Full Update
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

// Partial Updates (For Step-by-Step UI)
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

export const updateCourseDescriptions = createAsyncThunk(
  "courses/updateDescriptions",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await courseService.updateDescriptions(id, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update descriptions",
      );
    }
  },
);

// Delete
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

// Status
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

// --- Sub-Entity Operations ---

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

export const addClassesToCourse = createAsyncThunk(
  "courses/addClasses",
  async ({ id, classes, classMedia }, { rejectWithValue }) => {
    try {
      return await courseService.addClasses(id, classes, classMedia);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add classes",
      );
    }
  },
);

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

// --- Slice ---

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    selectedCourse: null,
    loading: false,
    error: null,
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
    // Helper to handle loading/error for typical actions
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    const handleFulfilledUpdate = (state, action) => {
      state.loading = false;
      const updatedCourse = action.payload.data || action.payload;

      // Update in list
      const index = state.courses.findIndex((c) => c._id === updatedCourse._id);
      if (index !== -1) {
        state.courses[index] = { ...state.courses[index], ...updatedCourse };
      }

      // Update selected if matching
      if (
        state.selectedCourse &&
        state.selectedCourse._id === updatedCourse._id
      ) {
        state.selectedCourse = { ...state.selectedCourse, ...updatedCourse };
      }
    };

    builder
      // Fetch All
      .addCase(fetchCourses.pending, handlePending)
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data || action.payload || [];
      })
      .addCase(fetchCourses.rejected, handleRejected)

      // Fetch One
      .addCase(fetchCourseById.pending, handlePending)
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload.data || action.payload;
      })
      .addCase(fetchCourseById.rejected, handleRejected)

      // Create
      .addCase(createCourse.pending, handlePending)
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        const newCourse = action.payload.data || action.payload;
        state.courses.unshift(newCourse);
      })
      .addCase(createCourse.rejected, handleRejected)

      // All Updates (Full, Basic, Content, Descriptions)
      .addCase(updateCourse.pending, handlePending)
      .addCase(updateCourse.fulfilled, handleFulfilledUpdate)
      .addCase(updateCourse.rejected, handleRejected)

      .addCase(updateCourseBasic.pending, handlePending)
      .addCase(updateCourseBasic.fulfilled, handleFulfilledUpdate)
      .addCase(updateCourseBasic.rejected, handleRejected)

      .addCase(updateCourseContent.pending, handlePending)
      .addCase(updateCourseContent.fulfilled, handleFulfilledUpdate)
      .addCase(updateCourseContent.rejected, handleRejected)

      .addCase(updateCourseDescriptions.pending, handlePending)
      .addCase(updateCourseDescriptions.fulfilled, handleFulfilledUpdate)
      .addCase(updateCourseDescriptions.rejected, handleRejected)

      // Delete
      .addCase(deleteCourse.pending, handlePending)
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c._id !== action.payload);
        if (
          state.selectedCourse &&
          state.selectedCourse._id === action.payload
        ) {
          state.selectedCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, handleRejected)

      // Status Changes
      .addCase(publishCourse.pending, handlePending)
      .addCase(publishCourse.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const index = state.courses.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.courses[index] = { ...state.courses[index], isActive: true };
        }
        if (state.selectedCourse?._id === updated._id) {
          state.selectedCourse.isActive = true;
        }
      })
      .addCase(publishCourse.rejected, handleRejected)

      .addCase(unpublishCourse.pending, handlePending)
      .addCase(unpublishCourse.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const index = state.courses.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.courses[index] = { ...state.courses[index], isActive: false };
        }
        if (state.selectedCourse?._id === updated._id) {
          state.selectedCourse.isActive = false;
        }
      })
      .addCase(unpublishCourse.rejected, handleRejected)

      // Sub-Entity Updates (Tutors, Classes, Materials)
      // These all return the full course object, so we can reuse handleFulfilledUpdate
      .addCase(addTutors.pending, handlePending)
      .addCase(addTutors.fulfilled, handleFulfilledUpdate)
      .addCase(addTutors.rejected, handleRejected)

      .addCase(updateTutor.pending, handlePending)
      .addCase(updateTutor.fulfilled, handleFulfilledUpdate)
      .addCase(updateTutor.rejected, handleRejected)

      .addCase(deleteTutor.pending, handlePending)
      .addCase(deleteTutor.fulfilled, handleFulfilledUpdate)
      .addCase(deleteTutor.rejected, handleRejected)

      .addCase(addClassesToCourse.pending, handlePending)
      .addCase(addClassesToCourse.fulfilled, handleFulfilledUpdate)
      .addCase(addClassesToCourse.rejected, handleRejected)

      .addCase(updateClass.pending, handlePending)
      .addCase(updateClass.fulfilled, handleFulfilledUpdate)
      .addCase(updateClass.rejected, handleRejected)

      .addCase(deleteClass.pending, handlePending)
      .addCase(deleteClass.fulfilled, handleFulfilledUpdate)
      .addCase(deleteClass.rejected, handleRejected)

      .addCase(uploadClassMedia.pending, handlePending)
      .addCase(uploadClassMedia.fulfilled, handleFulfilledUpdate)
      .addCase(uploadClassMedia.rejected, handleRejected)

      .addCase(deleteStudyMaterial.pending, handlePending)
      .addCase(deleteStudyMaterial.fulfilled, handleFulfilledUpdate)
      .addCase(deleteStudyMaterial.rejected, handleRejected);
  },
});

export const { clearError, clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;
