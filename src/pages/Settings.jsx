import React, { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Palette,
  Sun,
  Moon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

// --- DEFAULT THEME CONFIGURATION (Simplified: Sidebar, Header, Page) ---
const DEFAULT_THEME_CONFIG = {
  light: {
    // Main Layout Colors
    "--color-sidebar-bg": "#ffffff", // White
    "--color-header-bg": "#ffffff", // White
    "--color-page-bg": "#f1f5f9", // Slate 100

    // Brand Colors (kept for buttons/accents)
    "--color-primary": "#6366f1", // Indigo 500
    "--color-primary-hover": "#4f46e5", // Indigo 600
    "--color-primary-light": "#e0e7ff", // Indigo 100
    "--color-primary-text": "#4338ca", // Indigo 700

    // Other Layout Colors (kept for consistency)
    "--color-card": "#ffffff", // White
    "--color-border": "#e2e8f0", // Slate 200

    // Text Colors
    "--color-text-main": "#0f172a", // Slate 900
    "--color-text-sub": "#64748b", // Slate 500
    "--color-text-muted": "#94a3b8", // Slate 400
    "--color-text-inverse": "#ffffff", // White

    // Input Colors
    "--color-input-bg": "#ffffff",
    "--color-input-border": "#cbd5e1",
    "--color-input-focus": "#6366f1",
  },
  dark: {
    // Main Layout Colors
    "--color-sidebar-bg": "#0f172a", // Slate 900
    "--color-header-bg": "#0f172a", // Slate 900
    "--color-page-bg": "#020617", // Slate 950

    // Brand Colors (kept for buttons/accents)
    "--color-primary": "#818cf8", // Indigo 400
    "--color-primary-hover": "#6366f1", // Indigo 500
    "--color-primary-light": "rgba(99, 102, 241, 0.15)",
    "--color-primary-text": "#c7d2fe", // Indigo 200

    // Other Layout Colors (kept for consistency)
    "--color-card": "#0f172a", // Slate 900
    "--color-border": "#1e293b", // Slate 800

    // Text Colors
    "--color-text-main": "#f8fafc", // Slate 50
    "--color-text-sub": "#94a3b8", // Slate 400
    "--color-text-muted": "#64748b", // Slate 500
    "--color-text-inverse": "#020617", // Slate 950

    // Input Colors
    "--color-input-bg": "#0f172a",
    "--color-input-border": "#334155",
    "--color-input-focus": "#818cf8",
  },
};

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State to hold current config
  const [themeConfig, setThemeConfig] = useState(DEFAULT_THEME_CONFIG);

  // --- 1. Load Settings on Mount ---
  useEffect(() => {
    // Try to load from local storage
    const savedConfig = localStorage.getItem("brainbuzz_theme_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Merge with defaults to ensure structure validity
        const merged = {
          light: { ...DEFAULT_THEME_CONFIG.light, ...parsed.light },
          dark: { ...DEFAULT_THEME_CONFIG.dark, ...parsed.dark },
        };
        setThemeConfig(merged);
        applyThemeStyles(merged);
      } catch (e) {
        console.error("Failed to parse theme config", e);
        applyThemeStyles(DEFAULT_THEME_CONFIG);
      }
    } else {
      // Use Defaults if nothing saved
      applyThemeStyles(DEFAULT_THEME_CONFIG);
    }
    setLoading(false);
  }, []);

  // --- 2. Helper: Apply CSS Variables to Document ---
  const applyThemeStyles = (config) => {
    const styleId = "dynamic-theme-styles";
    let styleTag = document.getElementById(styleId);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    // Helper to generate CSS string from object
    const generateVars = (obj) =>
      Object.entries(obj)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n");

    // Add fallback for --color-page (for backward compatibility)
    const lightWithFallback = {
      ...config.light,
      "--color-page":
        config.light["--color-page-bg"] || config.light["--color-page"],
    };

    const darkWithFallback = {
      ...config.dark,
      "--color-page":
        config.dark["--color-page-bg"] || config.dark["--color-page"],
    };

    const css = `
      :root {
        ${generateVars(lightWithFallback)}
      }
      .dark {
        ${generateVars(darkWithFallback)}
      }
    `;

    styleTag.innerHTML = css;
  };

  // --- 3. Handlers ---
  const handleColorChange = (mode, key, value) => {
    setThemeConfig((prev) => {
      const newConfig = {
        ...prev,
        [mode]: {
          ...prev[mode],
          [key]: value,
        },
      };
      // Apply immediately for live preview
      applyThemeStyles(newConfig);
      return newConfig;
    });
  };

  const handleReset = () => {
    if (window.confirm("Reset theme colors to default Royal Indigo?")) {
      setThemeConfig(DEFAULT_THEME_CONFIG);
      applyThemeStyles(DEFAULT_THEME_CONFIG);
      localStorage.setItem(
        "brainbuzz_theme_config",
        JSON.stringify(DEFAULT_THEME_CONFIG),
      );
      toast.success("Theme reset to defaults.");
    }
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call delay if needed, or just save to LS
    setTimeout(() => {
      localStorage.setItem(
        "brainbuzz_theme_config",
        JSON.stringify(themeConfig),
      );
      setSaving(false);
      toast.success("Theme settings saved successfully!");
    }, 500);
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-page-bg)" }}
      >
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8 w-full min-h-screen text-[var(--color-text-main)] font-sans pb-24 transition-colors duration-300"
      style={{ backgroundColor: "var(--color-page-bg)" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
            <p className="text-[var(--color-text-sub)] mt-1">
              Customize the look and feel of your BrainBuzz dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-text-sub)] bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-page)] transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-inverse)] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- LIGHT MODE SETTINGS --- */}
          <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Light Mode Palette</h2>
            </div>

            <div className="space-y-6">
              {/* Layout Colors */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Layout Colors
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "--color-sidebar-bg", label: "Sidebar Background" },
                    { key: "--color-header-bg", label: "Header Background" },
                    { key: "--color-page-bg", label: "Page Background" },
                  ].map((item) => (
                    <ColorInput
                      key={item.key}
                      label={item.label}
                      value={themeConfig.light[item.key]}
                      onChange={(val) =>
                        handleColorChange("light", item.key, val)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- DARK MODE SETTINGS --- */}
          <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-[var(--color-border)]">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Dark Mode Overrides</h2>
            </div>

            <div className="space-y-6">
              {/* Layout Colors */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Layout Colors (Dark)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "--color-sidebar-bg", label: "Sidebar Background" },
                    { key: "--color-header-bg", label: "Header Background" },
                    { key: "--color-page-bg", label: "Page Background" },
                  ].map((item) => (
                    <ColorInput
                      key={item.key}
                      label={item.label}
                      value={themeConfig.dark[item.key]}
                      onChange={(val) =>
                        handleColorChange("dark", item.key, val)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT FOR COLOR INPUT ---
const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)] transition-all shadow-sm hover:shadow-md">
    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-[var(--color-border)] cursor-pointer group">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
      />
      <div className="absolute inset-0 group-hover:ring-2 group-hover:ring-[var(--color-primary)] rounded-xl pointer-events-none"></div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-[var(--color-text-main)] mb-1">
        {label}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] font-mono uppercase">
        {value}
      </p>
    </div>
  </div>
);

export default Settings;
