import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bannerService } from "../../api/bannerService";
import toast from "react-hot-toast";

// Helper to safely format data
const formatBanner = (apiData) => {
  if (!apiData) return null;
  return {
    ...apiData,
    images: apiData.images || [],
    featureCards: apiData.featureCards || [],
    styleConfig: {
      headingColor: apiData.styleConfig?.headingColor || "#1e293b",
      descriptionColor: apiData.styleConfig?.descriptionColor || "#475569",
      secondaryTitleColor:
        apiData.styleConfig?.secondaryTitleColor || "#1e293b",
      overlayColor: apiData.styleConfig?.overlayColor || "#000000",
      overlayOpacity: apiData.styleConfig?.overlayOpacity ?? 0,
      textAlign: apiData.styleConfig?.textAlign || "left",
    },
  };
};

export const fetchBanner = createAsyncThunk(
  "banners/fetch",
  async (pageType, { rejectWithValue }) => {
    try {
      const response = await bannerService.get(pageType);
      return { pageType, data: formatBanner(response.data) };
    } catch (error) {
      if (error.response?.status === 404) return { pageType, data: null };
      return rejectWithValue(error.message);
    }
  },
);

export const saveBanner = createAsyncThunk(
  "banners/save",
  async ({ formData, pageType }, { dispatch, rejectWithValue }) => {
    try {
      await bannerService.upsert(formData);
      toast.success("Changes saved successfully");
      dispatch(fetchBanner(pageType));
      return pageType;
    } catch (error) {
      toast.error("Save failed");
      return rejectWithValue(error.message);
    }
  },
);

export const addBannerImages = createAsyncThunk(
  "banners/addImages",
  async ({ formData, pageType }, { dispatch, rejectWithValue }) => {
    try {
      await bannerService.addImages(formData);
      toast.success("Images added");
      dispatch(fetchBanner(pageType));
      return pageType;
    } catch (error) {
      toast.error("Failed to add images");
      return rejectWithValue(error.message);
    }
  },
);

export const deleteBannerImage = createAsyncThunk(
  "banners/deleteImage",
  async ({ pageType, imageId }, { dispatch, rejectWithValue }) => {
    try {
      await bannerService.deleteImage(pageType, imageId);
      toast.success("Image removed");
      dispatch(fetchBanner(pageType));
      return pageType;
    } catch (error) {
      toast.error("Failed to remove image");
      return rejectWithValue(error.message);
    }
  },
);

const bannerSlice = createSlice({
  name: "banners",
  initialState: { homeBanner: null, aboutBanner: null, isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanner.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.pageType === "HOME")
          state.homeBanner = action.payload.data;
        else state.aboutBanner = action.payload.data;
      })
      .addCase(fetchBanner.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default bannerSlice.reducer;
