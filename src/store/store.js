import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import bannerReducer from "./slices/bannerSlice";
import couponReducer from "./slices/couponSlice";
import orderReducer from "./slices/orderSlice";
import pyqReducer from "./slices/pyqSlice";
import examReducer from "./slices/examSlice";
import subjectReducer from "./slices/subjectSlice";
import languageReducer from "./slices/languageSlice";
import validityReducer from "./slices/validitySlice";
import publicationReducer from "./slices/publicationSlice";
import currentAffairsReducer from "./slices/currentAffairsSlice";
import eBookReducer from "./slices/eBookSlice";
import dailyQuizReducer from "./slices/dailyQuizSlice";
import courseReducer from "./slices/courseSlice";
import testSeriesReducer from "./slices/testSeriesSlice";
import liveClassReducer from "./slices/liveClassSlice";
// Import the new reducers
import categoryReducer from "./slices/categorySlice";
import subCategoryReducer from "./slices/subCategorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    banners: bannerReducer,
    coupons: couponReducer,
    orders: orderReducer,
    pyq: pyqReducer,
    exams: examReducer,
    subjects: subjectReducer,
    languages: languageReducer,
    validities: validityReducer,
    publications: publicationReducer,
    currentAffairs: currentAffairsReducer,
    ebooks: eBookReducer,
    courses: courseReducer,
    testSeries: testSeriesReducer,
    liveClasses: liveClassReducer,
    dailyQuizzes: dailyQuizReducer,
    // ✅ FIX: Use singular keys to match 'state.category' in your components
    category: categoryReducer,
    subCategory: subCategoryReducer,
  },
});
