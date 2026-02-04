import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import subCategoryService from "../../api/subCategoryService";

// --- THUNKS ---

export const fetchSubCategories = createAsyncThunk(
  "subCategory/fetchAll",
  async ({ contentType, categoryId } = {}, { rejectWithValue }) => {
    try {
      const response = await subCategoryService.getAll(contentType, categoryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategories",
      );
    }
  },
);

export const createSubCategory = createAsyncThunk(
  "subCategory/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await subCategoryService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Creation failed",
      );
    }
  },
);

export const updateSubCategory = createAsyncThunk(
  "subCategory/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await subCategoryService.update(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const deleteSubCategory = createAsyncThunk(
  "subCategory/delete",
  async (id, { rejectWithValue }) => {
    try {
      await subCategoryService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

// --- SLICE ---

const subCategorySlice = createSlice({
  name: "subCategory", // ✅ Singular to match store
  initialState: {
    subCategories: [], // Matched to component usage
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload;
        state.items = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
        if (state.subCategories) state.subCategories.push(action.payload);
      })

      // Update
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
          if (state.subCategories) state.subCategories[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.subCategories)
          state.subCategories = state.subCategories.filter(
            (item) => item._id !== action.payload,
          );
      });
  },
});

export default subCategorySlice.reducer;
