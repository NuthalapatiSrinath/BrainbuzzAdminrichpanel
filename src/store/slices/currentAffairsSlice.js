import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import currentAffairsService from "../../api/currentAffairsService";

// --- THUNKS FOR CONTENT ---
export const fetchCurrentAffairs = createAsyncThunk(
  "currentAffairs/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.getAll(params);
      // The API returns { data: { "International": [...], "Sports": [...] } } if grouped
      // Or we might want to flatten it for the table depending on UI.
      // Based on controller, it returns groupedData if no category filter.
      // For the Table, we usually want a flat list.
      // Let's flatten the grouped object into an array for the table.
      const grouped = response.data || {};
      let flatList = [];
      if (Array.isArray(grouped)) {
        flatList = grouped;
      } else {
        Object.values(grouped).forEach(
          (arr) => (flatList = [...flatList, ...arr]),
        );
      }
      return flatList;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch",
      );
    }
  },
);

export const createCurrentAffair = createAsyncThunk(
  "currentAffairs/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create",
      );
    }
  },
);

export const updateCurrentAffair = createAsyncThunk(
  "currentAffairs/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update",
      );
    }
  },
);

export const deleteCurrentAffair = createAsyncThunk(
  "currentAffairs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await currentAffairsService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete",
      );
    }
  },
);

// --- THUNKS FOR TYPES (CATEGORIES) ---
export const fetchCATypes = createAsyncThunk(
  "currentAffairs/fetchTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.getTypes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createCAType = createAsyncThunk(
  "currentAffairs/createType",
  async (data, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.createType(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateCAType = createAsyncThunk(
  "currentAffairs/updateType",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.updateType(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteCAType = createAsyncThunk(
  "currentAffairs/deleteType",
  async (id, { rejectWithValue }) => {
    try {
      await currentAffairsService.deleteType(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const toggleCATypeStatus = createAsyncThunk(
  "currentAffairs/toggleTypeStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await currentAffairsService.toggleTypeStatus(
        id,
        isActive,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const currentAffairsSlice = createSlice({
  name: "currentAffairs",
  initialState: {
    items: [], // Content List
    types: [], // Categories List (International, etc.)
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Content
      .addCase(fetchCurrentAffairs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentAffairs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCurrentAffairs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCurrentAffair.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCurrentAffair.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteCurrentAffair.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      // Types
      .addCase(fetchCATypes.fulfilled, (state, action) => {
        state.types = action.payload;
      })
      .addCase(createCAType.fulfilled, (state, action) => {
        state.types.push(action.payload);
      })
      .addCase(updateCAType.fulfilled, (state, action) => {
        const index = state.types.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.types[index] = action.payload;
      })
      .addCase(deleteCAType.fulfilled, (state, action) => {
        state.types = state.types.filter((i) => i._id !== action.payload);
      })
      .addCase(toggleCATypeStatus.fulfilled, (state, action) => {
        const index = state.types.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.types[index] = action.payload;
      });
  },
});

export default currentAffairsSlice.reducer;
