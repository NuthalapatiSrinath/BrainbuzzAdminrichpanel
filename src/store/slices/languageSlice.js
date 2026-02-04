import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import languageService from "../../api/languageService";

export const fetchLanguages = createAsyncThunk(
  "languages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await languageService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch languages",
      );
    }
  },
);

export const createLanguage = createAsyncThunk(
  "languages/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await languageService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create language",
      );
    }
  },
);

export const updateLanguage = createAsyncThunk(
  "languages/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await languageService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update language",
      );
    }
  },
);

export const deleteLanguage = createAsyncThunk(
  "languages/delete",
  async (id, { rejectWithValue }) => {
    try {
      await languageService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete language",
      );
    }
  },
);

const languageSlice = createSlice({
  name: "languages",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLanguage.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteLanguage.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default languageSlice.reducer;
