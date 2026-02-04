import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import examService from "../../api/examService";

export const fetchExams = createAsyncThunk(
  "exams/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await examService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch exams",
      );
    }
  },
);

export const createExam = createAsyncThunk(
  "exams/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await examService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create exam",
      );
    }
  },
);

export const updateExam = createAsyncThunk(
  "exams/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await examService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update exam",
      );
    }
  },
);

export const deleteExam = createAsyncThunk(
  "exams/delete",
  async (id, { rejectWithValue }) => {
    try {
      await examService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete exam",
      );
    }
  },
);

const examSlice = createSlice({
  name: "exams",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default examSlice.reducer;
