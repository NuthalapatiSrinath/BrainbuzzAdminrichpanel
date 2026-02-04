import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import liveClassService from "../../api/liveClassService";

export const fetchLiveClasses = createAsyncThunk(
  "liveClasses/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await liveClassService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch",
      );
    }
  },
);

export const createLiveClass = createAsyncThunk(
  "liveClasses/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await liveClassService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create",
      );
    }
  },
);

export const updateLiveClass = createAsyncThunk(
  "liveClasses/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await liveClassService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update",
      );
    }
  },
);

export const deleteLiveClass = createAsyncThunk(
  "liveClasses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await liveClassService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete",
      );
    }
  },
);

export const toggleLiveClassStatus = createAsyncThunk(
  "liveClasses/toggleStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await liveClassService.toggleStatus(id, isActive);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle status",
      );
    }
  },
);

const liveClassSlice = createSlice({
  name: "liveClasses",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveClasses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLiveClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLiveClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLiveClass.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLiveClass.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteLiveClass.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(toggleLiveClassStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default liveClassSlice.reducer;
