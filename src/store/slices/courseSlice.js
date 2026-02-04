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
        const publishedCourse = action.payload.data;
        const index = state.courses.findIndex(
          (c) => c._id === publishedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = publishedCourse;
        }
      })
      .addCase(publishCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Unpublish Course
      .addCase(unpublishCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unpublishCourse.fulfilled, (state, action) => {
        state.loading = false;
        const unpublishedCourse = action.payload.data;
        const index = state.courses.findIndex(
          (c) => c._id === unpublishedCourse._id,
        );
        if (index !== -1) {
          state.courses[index] = unpublishedCourse;
        }
      })
      .addCase(unpublishCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;
