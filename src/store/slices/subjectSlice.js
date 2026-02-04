import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import subjectService from "../../api/subjectService";

export const fetchSubjects = createAsyncThunk(
  "subjects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subjects",
      );
    }
  },
);

export const createSubject = createAsyncThunk(
  "subjects/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await subjectService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subject",
      );
    }
  },
);

export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subjectService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subject",
      );
    }
  },
);

export const deleteSubject = createAsyncThunk(
  "subjects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await subjectService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subject",
      );
    }
  },
);

const subjectSlice = createSlice({
  name: "subjects",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default subjectSlice.reducer;
