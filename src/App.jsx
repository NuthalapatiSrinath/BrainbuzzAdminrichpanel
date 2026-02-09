import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import { BookOpen } from "lucide-react";

// --- Custom Loading Screen ---
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
    <div className="relative">
      <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center animate-pulse">
        <BookOpen className="w-10 h-10 text-indigo-600" strokeWidth={2} />
      </div>
    </div>
    <p className="mt-4 text-slate-500 font-medium text-sm tracking-widest uppercase animate-pulse">
      Loading Brain Buzz Admin...
    </p>
  </div>
);

// Define themes here strictly for initialization to match Settings.jsx
const THEMES_CONFIG = {
  royal_indigo: {
    "--color-primary": "#6366f1",
    "--color-primary-hover": "#4f46e5",
    "--color-primary-light": "#e0e7ff",
    "--color-primary-text": "#4338ca",
  },
  luxe_gold: {
    "--color-primary": "#ca8a04",
    "--color-primary-hover": "#a16207",
    "--color-primary-light": "#fefce8",
    "--color-primary-text": "#854d0e",
  },
  emerald_forest: {
    "--color-primary": "#10b981",
    "--color-primary-hover": "#059669",
    "--color-primary-light": "#ecfdf5",
    "--color-primary-text": "#065f46",
  },
  crimson_rose: {
    "--color-primary": "#e11d48",
    "--color-primary-hover": "#be123c",
    "--color-primary-light": "#fff1f2",
    "--color-primary-text": "#9f1239",
  },
  ocean_blue: {
    "--color-primary": "#0ea5e9",
    "--color-primary-hover": "#0284c7",
    "--color-primary-light": "#e0f2fe",
    "--color-primary-text": "#075985",
  },
};

function App() {
  const { mode } = useSelector((state) => state.theme);
  const [appReady, setAppReady] = useState(false);

  // 0. Initial app boot (makes UI feel smoother)
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // 1. Apply Dark/Light Mode
  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  // 2. Apply Saved Color Theme
  useEffect(() => {
    const savedThemeId = localStorage.getItem("theme_color") || "royal_indigo";
    const themeVariables = THEMES_CONFIG[savedThemeId];

    if (themeVariables) {
      const root = document.documentElement;
      Object.entries(themeVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, []);

  if (!appReady) return <LoadingScreen />;

  return (
    <BrowserRouter>
      {/* --- ENHANCED TOASTER SETTINGS --- */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: mode === "dark" ? "#1e293b" : "#fff",
            color: mode === "dark" ? "#fff" : "#0f172a",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            border: mode === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
          },
          success: {
            iconTheme: { primary: "#10B981", secondary: "#fff" },
            style: {
              borderLeft: "4px solid #10B981",
              background: mode === "dark" ? "#1e293b" : "#f0fdf4",
            },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: "#EF4444", secondary: "#fff" },
            style: {
              borderLeft: "4px solid #EF4444",
              background: mode === "dark" ? "#1e293b" : "#fef2f2",
            },
          },
          loading: {
            style: {
              borderLeft: "4px solid #3b82f6",
            },
          },
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
