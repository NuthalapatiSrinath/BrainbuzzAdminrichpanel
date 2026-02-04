import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import eBookService from "../../api/eBookService";

export const fetchEBooks = createAsyncThunk(
  "ebooks/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await eBookService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch",
      );
    }
  },
);

export const createEBook = createAsyncThunk(
  "ebooks/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await eBookService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create",
      );
    }
  },
);

export const updateEBook = createAsyncThunk(
  "ebooks/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await eBookService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update",
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
        error.response?.data?.message || "Failed to delete",
      );
    }
  },
);

const eBookSlice = createSlice({
  name: "ebooks",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEBook.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEBook.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteEBook.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default eBookSlice.reducer;
