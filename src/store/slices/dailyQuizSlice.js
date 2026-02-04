import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import dailyQuizService from "../../api/dailyQuizService";

export const fetchDailyQuizzes = createAsyncThunk(
  "dailyQuizzes/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await dailyQuizService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch",
      );
    }
  },
);

export const createDailyQuiz = createAsyncThunk(
  "dailyQuizzes/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await dailyQuizService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create",
      );
    }
  },
);

export const updateDailyQuiz = createAsyncThunk(
  "dailyQuizzes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await dailyQuizService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update",
      );
    }
  },
);

export const deleteDailyQuiz = createAsyncThunk(
  "dailyQuizzes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await dailyQuizService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete",
      );
    }
  },
);

const dailyQuizSlice = createSlice({
  name: "dailyQuizzes",
  initialState: { quizzes: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyQuizzes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDailyQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchDailyQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDailyQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(updateDailyQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.quizzes[index] = action.payload;
      })
      .addCase(deleteDailyQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((i) => i._id !== action.payload);
      });
  },
});

export default dailyQuizSlice.reducer;
