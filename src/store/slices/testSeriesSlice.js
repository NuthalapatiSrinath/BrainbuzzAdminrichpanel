import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import testSeriesService from "../../api/testSeriesService";

export const fetchTestSeries = createAsyncThunk(
  "testSeries/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await testSeriesService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch",
      );
    }
  },
);

export const createTestSeries = createAsyncThunk(
  "testSeries/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await testSeriesService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create",
      );
    }
  },
);

export const updateTestSeries = createAsyncThunk(
  "testSeries/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await testSeriesService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update",
      );
    }
  },
);

export const deleteTestSeries = createAsyncThunk(
  "testSeries/delete",
  async (id, { rejectWithValue }) => {
    try {
      await testSeriesService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete",
      );
    }
  },
);

const testSeriesSlice = createSlice({
  name: "testSeries",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestSeries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTestSeries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTestSeries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTestSeries.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      })
      .addCase(updateTestSeries.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(
            (i) => i._id === action.payload._id,
          );
          if (index !== -1) state.items[index] = action.payload;
        }
      })
      .addCase(deleteTestSeries.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default testSeriesSlice.reducer;
