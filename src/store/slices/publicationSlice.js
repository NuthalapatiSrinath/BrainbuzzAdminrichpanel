import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import publicationService from "../../api/publicationService";

// --- Main Thunks ---

export const fetchPublications = createAsyncThunk(
  "publications/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await publicationService.getAll(params);
      return response; // returns { data: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch publications",
      );
    }
  },
);

export const createPublication = createAsyncThunk(
  "publications/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await publicationService.create(formData);
      return response; // returns { message: "...", data: { ... } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create publication",
      );
    }
  },
);

export const updatePublication = createAsyncThunk(
  "publications/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await publicationService.update(id, data);
      return response; // returns { message: "...", data: { ... } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update publication",
      );
    }
  },
);

export const deletePublication = createAsyncThunk(
  "publications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await publicationService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete publication",
      );
    }
  },
);

// --- Sub-Resource Thunks (To keep UI synced without full refresh) ---

export const updatePublicationFile = createAsyncThunk(
  "publications/updateFile",
  async ({ id, type, file }, { rejectWithValue }) => {
    try {
      let response;
      if (type === "thumbnail") {
        response = await publicationService.updateThumbnail(id, file);
      } else {
        response = await publicationService.updateBook(id, file);
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "File update failed",
      );
    }
  },
);

export const updatePublicationCategories = createAsyncThunk(
  "publications/updateCategories",
  async ({ id, categoryIds, subCategoryIds }, { rejectWithValue }) => {
    try {
      const response = await publicationService.updateCategories(
        id,
        categoryIds,
        subCategoryIds,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Category update failed",
      );
    }
  },
);

export const addPublicationAuthor = createAsyncThunk(
  "publications/addAuthor",
  async ({ id, authorData }, { rejectWithValue }) => {
    try {
      const response = await publicationService.addAuthor(id, authorData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Add author failed",
      );
    }
  },
);

export const updatePublicationAuthor = createAsyncThunk(
  "publications/updateAuthor",
  async ({ id, authorId, authorData }, { rejectWithValue }) => {
    try {
      const response = await publicationService.updateAuthor(
        id,
        authorId,
        authorData,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Update author failed",
      );
    }
  },
);

export const deletePublicationAuthor = createAsyncThunk(
  "publications/deleteAuthor",
  async ({ id, authorId }, { rejectWithValue }) => {
    try {
      const response = await publicationService.deleteAuthor(id, authorId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Delete author failed",
      );
    }
  },
);

export const addPublicationImage = createAsyncThunk(
  "publications/addImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const response = await publicationService.addImage(id, file);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Add image failed",
      );
    }
  },
);

export const removePublicationImage = createAsyncThunk(
  "publications/removeImage",
  async ({ id, imageUrl }, { rejectWithValue }) => {
    try {
      const response = await publicationService.removeImage(id, imageUrl);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Remove image failed",
      );
    }
  },
);

// --- Slice ---

const publicationSlice = createSlice({
  name: "publications",
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
    // Helper for loading state
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Helper for updating single item in list (Granular updates)
    const updateItem = (state, action) => {
      state.loading = false;
      // Backend returns { message: "...", data: { ... } }
      const updatedItem = action.payload?.data;
      if (updatedItem && updatedItem._id) {
        const index = state.items.findIndex((i) => i._id === updatedItem._id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      }
    };

    builder
      // Fetch
      .addCase(fetchPublications.pending, setPending)
      .addCase(fetchPublications.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { data: [...] }
        state.items = action.payload?.data || [];
      })
      .addCase(fetchPublications.rejected, setRejected)

      // Create
      .addCase(createPublication.pending, setPending)
      .addCase(createPublication.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.items.unshift(action.payload.data);
        }
      })
      .addCase(createPublication.rejected, setRejected)

      // Update Basic Info
      .addCase(updatePublication.pending, setPending)
      .addCase(updatePublication.fulfilled, updateItem)
      .addCase(updatePublication.rejected, setRejected)

      // Delete
      .addCase(deletePublication.pending, setPending)
      .addCase(deletePublication.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(deletePublication.rejected, setRejected)

      // Sub-resource Updates (All return full updated publication object in 'data')
      .addCase(updatePublicationFile.fulfilled, updateItem)
      .addCase(updatePublicationCategories.fulfilled, updateItem)
      .addCase(addPublicationAuthor.fulfilled, updateItem)
      .addCase(updatePublicationAuthor.fulfilled, updateItem)
      .addCase(deletePublicationAuthor.fulfilled, updateItem)
      .addCase(addPublicationImage.fulfilled, updateItem)
      .addCase(removePublicationImage.fulfilled, updateItem);
  },
});

export const { clearError } = publicationSlice.actions;
export default publicationSlice.reducer;
