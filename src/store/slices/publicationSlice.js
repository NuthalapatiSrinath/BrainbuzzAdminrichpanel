import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import publicationService from "../../api/publicationService";

export const fetchPublications = createAsyncThunk(
  "publications/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await publicationService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch",
      );
    }
  },
);

export const createPublication = createAsyncThunk(
  "publications/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await publicationService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create",
      );
    }
  },
);

export const updatePublication = createAsyncThunk(
  "publications/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await publicationService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update",
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
        error.response?.data?.message || "Failed to delete",
      );
    }
  },
);

// We won't make thunks for every sub-route to keep the slice clean.
// We will call the service directly in the component for those specific actions (like adding an author)
// and then reload the list or update the specific item in state if needed.

const publicationSlice = createSlice({
  name: "publications",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPublications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPublication.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePublication.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deletePublication.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default publicationSlice.reducer;
