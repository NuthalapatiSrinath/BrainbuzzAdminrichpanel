import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import eBookService from "../../api/eBookService";

// --- Thunks ---

export const fetchEBooks = createAsyncThunk(
  "ebooks/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await eBookService.getAll(params);
      return response; // Returns { data: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch e-books",
      );
    }
  },
);

export const createEBook = createAsyncThunk(
  "ebooks/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await eBookService.create(data);
      return response; // Returns { message: "...", data: { ... } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create e-book",
      );
    }
  },
);

export const updateEBook = createAsyncThunk(
  "ebooks/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await eBookService.update(id, data);
      return response; // Returns { message: "...", data: { ... } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update e-book",
      );
    }
  },
);

export const updateEBookFile = createAsyncThunk(
  "ebooks/updateFile",
  async ({ id, type, file }, { rejectWithValue }) => {
    try {
      let response;
      if (type === "thumbnail") {
        response = await eBookService.updateThumbnail(id, file);
      } else {
        response = await eBookService.updateBook(id, file);
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `Failed to update ${type}`,
      );
    }
  },
);

export const updateEBookCategories = createAsyncThunk(
  "ebooks/updateCategories",
  async ({ id, categoryIds, subCategoryIds }, { rejectWithValue }) => {
    try {
      const response = await eBookService.updateCategories(
        id,
        categoryIds,
        subCategoryIds,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update categories",
      );
    }
  },
);

export const deleteEBook = createAsyncThunk(
  "ebooks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await eBookService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete e-book",
      );
    }
  },
);

// --- Slice ---

const eBookSlice = createSlice({
  name: "ebooks",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Helper to update list item safely
    const handleUpdateFulfilled = (state, action) => {
      state.loading = false;
      const updatedItem = action.payload.data; // Extract .data from response
      if (updatedItem && updatedItem._id) {
        const index = state.items.findIndex((i) => i._id === updatedItem._id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      }
    };

    builder
      // Fetch
      .addCase(fetchEBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEBooks.fulfilled, (state, action) => {
        state.loading = false;
        // Unwrap response.data.data or fallback to payload if directly array
        state.items = action.payload.data || [];
      })
      .addCase(fetchEBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createEBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEBook.fulfilled, (state, action) => {
        state.loading = false;
        // Unwrap .data from response
        if (action.payload.data) {
          state.items.unshift(action.payload.data);
        }
      })
      .addCase(createEBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Updates (Reuse helper)
      .addCase(updateEBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEBook.fulfilled, handleUpdateFulfilled)
      .addCase(updateEBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEBookFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEBookFile.fulfilled, handleUpdateFulfilled)
      .addCase(updateEBookFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEBookCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEBookCategories.fulfilled, handleUpdateFulfilled)
      .addCase(updateEBookCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteEBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEBook.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(deleteEBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = eBookSlice.actions;
export default eBookSlice.reducer;
