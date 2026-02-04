import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";

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

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: mode === "dark" ? "#1e293b" : "#fff",
            color: mode === "dark" ? "#fff" : "#333",
            border: "1px solid var(--color-border)",
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
