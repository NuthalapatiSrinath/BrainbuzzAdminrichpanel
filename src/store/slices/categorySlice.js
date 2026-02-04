import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "../../api/categoryService";

// --- THUNKS ---

export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async ({ contentType, isActive } = {}, { rejectWithValue }) => {
    try {
      // Backend requires object params now based on service update
      const response = await categoryService.getAll(contentType, isActive);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

export const createCategory = createAsyncThunk(
  "category/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Creation failed",
      );
    }
  },
);

export const updateCategory = createAsyncThunk(
  "category/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

// --- SLICE ---

const categorySlice = createSlice({
  name: "category", // ✅ Singular to match store
  initialState: {
    categories: [], // Changed from 'items' to 'categories' to match your component logic if needed, or keep 'items'
    items: [], // Keeping 'items' based on your previous code
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload; // Updating both just in case
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
        if (state.categories) state.categories.push(action.payload);
      })

      // Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
          if (state.categories) state.categories[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.categories)
          state.categories = state.categories.filter(
            (item) => item._id !== action.payload,
          );
      });
  },
});

export default categorySlice.reducer;
