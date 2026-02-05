import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import Layout from "../layouts/Layout";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import BannerManager from "../pages/content/BannerManager";
import CouponManager from "../pages/content/CouponManager";
import OrderManager from "../pages/content/OrderManager";

// Content Management Pages
import PYQManager from "../pages/content/pyq/PYQManager";
import LanguageManager from "../pages/content/LanguageManager";
import ValidityManager from "../pages/content/ValidityManager";
import PublicationManager from "../pages/content/PublicationManager";
import CurrentAffairsManager from "../pages/content/CurrentAffairsManager";
import EBookManager from "../pages/content/EBookManager";
import DailyQuizManager from "../pages/content/DailyQuizManager";
import CourseManager from "../pages/content/CourseManager";
import LiveClassManager from "../pages/content/LiveClassManager";

// Test Series (New Page-Based Structure)
import TestSeriesList from "../pages/content/test-series/TestSeriesList";
import SeriesDashboard from "../pages/content/test-series/SeriesDashboard";
import TestDesigner from "../pages/content/test-series/TestDesigner";

// Placeholder for missing pages
const Placeholder = ({ title }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    <p className="text-slate-500 mt-2">This module is under development.</p>
  </div>
);

// --- ROUTE DEFINITIONS ---
export const appRoutes = [
  // Overview
  { path: "/", element: <Dashboard />, title: "Dashboard Overview" },

  // Content Management
  {
    path: "/banners",
    element: <BannerManager />,
    title: "Banner Management",
  },
  {
    path: "/coupons",
    element: <CouponManager />,
    title: "Coupon Management",
  },
  {
    path: "/orders",
    element: <OrderManager />,
    title: "Order Management",
  },

  // ✅ Previous Year Questions (Unified Route)
  {
    path: "/pyq",
    element: <PYQManager />,
    title: "Previous Year Questions",
  },
  // Redirect sub-routes to the main manager to prevent 404s
  {
    path: "/pyq/categories",
    element: <PYQManager />,
    title: "PYQ Categories",
  },
  {
    path: "/pyq/subcategories",
    element: <PYQManager />,
    title: "PYQ SubCategories",
  },
  {
    path: "/languages",
    element: <LanguageManager />,
    title: "Languages",
  },
  {
    path: "/publications",
    element: <PublicationManager />,
    title: "Publications",
  },

  {
    path: "/validity",
    element: <ValidityManager />,
    title: "Validity Options",
  },
  {
    path: "/current-affairs",
    element: <CurrentAffairsManager />,
    title: "Current Affairs",
  },
  {
    path: "/ebooks",
    element: <EBookManager />,
    title: "E-Books",
  },
  {
    path: "/daily-quizzes",
    element: <DailyQuizManager />,
    title: "Daily Quizzes",
  },
  {
    path: "/courses",
    element: <CourseManager />,
    title: "Online Courses",
  },
  {
    path: "/live-classes",
    element: <LiveClassManager />,
    title: "Live Classes",
  },

  // --- Test Series (New Routes) ---
  {
    path: "/test-series",
    element: <TestSeriesList />,
    title: "Test Series List",
  },
  {
    path: "/test-series/create",
    element: <SeriesDashboard />, // Create Mode
    title: "Create Series",
  },
  {
    path: "/test-series/:id",
    element: <SeriesDashboard />, // Edit/Manage Mode
    title: "Manage Series",
  },
  {
    path: "/test-series/:seriesId/tests/:testId",
    element: <TestDesigner />, // Deep Test Editing
    title: "Design Test",
  },

  // Inventory
  {
    path: "/inventory/products",
    element: <Placeholder title="Product Catalog" />,
    title: "Product Catalog",
  },
  {
    path: "/inventory/categories",
    element: <Placeholder title="Categories" />,
    title: "Category Management",
  },
  {
    path: "/inventory/stock",
    element: <Placeholder title="Stock Adjustment" />,
    title: "Stock Management",
  },

  // Business Logic
  {
    path: "/gold-rates",
    element: <Placeholder title="Gold Rates" />,
    title: "Daily Gold Rates",
  },
  {
    path: "/suppliers",
    element: <Placeholder title="Suppliers" />,
    title: "Supplier Directory",
  },

  // Sales
  {
    path: "/orders/new",
    element: <Placeholder title="New Order" />,
    title: "Create New Order",
  },
  {
    path: "/customers",
    element: <Placeholder title="Customers" />,
    title: "Customer Database",
  },

  // Management
  {
    path: "/finance/transactions",
    element: <Placeholder title="Transactions" />,
    title: "Financial Transactions",
  },
  {
    path: "/staff",
    element: <Placeholder title="Staff" />,
    title: "Staff & Karigars",
  },
  {
    path: "/reports",
    element: <Placeholder title="Reports" />,
    title: "Business Reports",
  },

  // Support
  {
    path: "/support",
    element: <Placeholder title="Support" />,
    title: "Help & Support",
  },
];

// --- COMPONENTS ---

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Generate Routes */}
        {appRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
