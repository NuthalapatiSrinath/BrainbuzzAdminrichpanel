import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { couponService } from "../../api/couponService";
import toast from "react-hot-toast";

// --- THUNKS ---

export const fetchCoupons = createAsyncThunk(
  "coupons/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await couponService.getAll(params);
      return response.data; // Expecting { docs, totalDocs, limit, page, ... } from mongoose-paginate
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons",
      );
    }
  },
);

export const createCoupon = createAsyncThunk(
  "coupons/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await couponService.create(data);
      toast.success("Coupon created successfully");
      return response.data;
    } catch (error) {
      // Handle express-validator errors array
      if (error.response?.data?.errors) {
        const firstError = error.response.data.errors[0].msg;
        toast.error(firstError);
        return rejectWithValue(firstError);
      }
      const msg = error.response?.data?.message || "Creation failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const updateCoupon = createAsyncThunk(
  "coupons/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await couponService.update(id, data);
      toast.success("Coupon updated successfully");
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const toggleCouponStatus = createAsyncThunk(
  "coupons/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await couponService.toggleStatus(id);
      toast.success("Status updated");
      return { id, isActive: response.data.isActive };
    } catch (error) {
      toast.error("Failed to update status");
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCoupon = createAsyncThunk(
  "coupons/delete",
  async (id, { rejectWithValue }) => {
    try {
      await couponService.delete(id);
      toast.success("Coupon deleted");
      return id;
    } catch (error) {
      toast.error("Delete failed");
      return rejectWithValue(error.message);
    }
  },
);

// --- SLICE ---

const couponSlice = createSlice({
  name: "coupons",
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.docs;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          totalDocs: action.payload.totalDocs,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      // Toggle Status
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        const item = state.items.find((i) => i._id === action.payload.id);
        if (item) item.isActive = action.payload.isActive;
      })
      // Delete
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default couponSlice.reducer;
