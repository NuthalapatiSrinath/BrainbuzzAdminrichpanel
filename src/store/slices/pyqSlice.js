import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { pyqService } from "../../api/pyqService";

// ==========================================
// ASYNC THUNKS
// ==========================================

/**
 * Fetch all Previous Question Papers
 */
export const fetchPYQs = createAsyncThunk(
  "pyq/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // Backend returns: { success: true, data: [...] }
      const response = await pyqService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Question Papers",
      );
    }
  },
);

/**
 * Create a new Question Paper
 */
export const createPYQ = createAsyncThunk(
  "pyq/create",
  async (data, { rejectWithValue }) => {
    try {
      // Backend returns: { success: true, message: '...', data: { ...paper } }
      const response = await pyqService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create Question Paper",
      );
    }
  },
);

/**
 * Update an existing Question Paper
 */
export const updatePYQ = createAsyncThunk(
  "pyq/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Backend returns: { success: true, data: { ...updatedPaper } }
      const response = await pyqService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update Question Paper",
      );
    }
  },
);

/**
 * Delete a Question Paper
 */
export const deletePYQ = createAsyncThunk(
  "pyq/delete",
  async (id, { rejectWithValue }) => {
    try {
      // Backend returns: { success: true, message: 'Question paper deleted' }
      await pyqService.delete(id);
      return id; // Return ID to remove from local state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete Question Paper",
      );
    }
  },
);

// ==========================================
// SLICE
// ==========================================

const pyqSlice = createSlice({
  name: "pyq",
  initialState: {
    pyqs: [], // List of papers
    loading: false, // Loading state for tables/buttons
    error: null, // Error messages
  },
  reducers: {
    // Action to manually clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ALL ---
      .addCase(fetchPYQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPYQs.fulfilled, (state, action) => {
        state.loading = false;
        state.pyqs = action.payload; // Payload is the array of papers
      })
      .addCase(fetchPYQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- CREATE ---
      .addCase(createPYQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPYQ.fulfilled, (state, action) => {
        state.loading = false;
        // Add new paper to the top of the list
        state.pyqs.unshift(action.payload);
      })
      .addCase(createPYQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- UPDATE ---
      .addCase(updatePYQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePYQ.fulfilled, (state, action) => {
        state.loading = false;
        // Find and replace the updated paper in the list
        const index = state.pyqs.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.pyqs[index] = action.payload;
        }
      })
      .addCase(updatePYQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- DELETE ---
      .addCase(deletePYQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePYQ.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted paper from the list
        state.pyqs = state.pyqs.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePYQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = pyqSlice.actions;
export default pyqSlice.reducer;
