import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import validityService from "../../api/validityService";

export const fetchValidities = createAsyncThunk(
  "validities/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await validityService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch validities",
      );
    }
  },
);

export const createValidity = createAsyncThunk(
  "validities/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await validityService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create validity",
      );
    }
  },
);

export const updateValidity = createAsyncThunk(
  "validities/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await validityService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update validity",
      );
    }
  },
);

export const deleteValidity = createAsyncThunk(
  "validities/delete",
  async (id, { rejectWithValue }) => {
    try {
      await validityService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete validity",
      );
    }
  },
);

const validitySlice = createSlice({
  name: "validities",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchValidities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValidities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchValidities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createValidity.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateValidity.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteValidity.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default validitySlice.reducer;
