import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "../../api/orderService";
import toast from "react-hot-toast";

// --- THUNKS ---

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getAll(params);
      // Backend returns { success: true, data: { orders: [], total: ... } }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOne",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch details",
      );
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status }, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderService.updateStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      // Refresh the specific order details if open
      dispatch(fetchOrderDetails(orderId));
      return { orderId, status, data: response.data };
    } catch (error) {
      toast.error("Failed to update status");
      return rejectWithValue(error.message);
    }
  },
);

// --- SLICE ---

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    currentOrder: null, // For the details modal
    pagination: {
      page: 1,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.orders;
        state.pagination = {
          page: action.payload.page,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single
      .addCase(fetchOrderDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state) => {
        state.detailsLoading = false;
      })

      // Update Status (Optimistic update in list)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (o) => o._id === action.payload.orderId,
        );
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (
          state.currentOrder &&
          state.currentOrder._id === action.payload.orderId
        ) {
          state.currentOrder.status = action.payload.status;
        }
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
