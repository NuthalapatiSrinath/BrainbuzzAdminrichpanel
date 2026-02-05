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

// --- DEFAULT THEME CONFIGURATION ---
const DEFAULT_THEME_CONFIG = {
  light: {
    primary: "#3b82f6",
    page: "#f8fafc",
    card: "#ffffff",
    border: "#e2e8f0",
    textMain: "#0f172a",
    textSub: "#475569",
    textMuted: "#94a3b8",
    // Accents
    indigo: "#6366f1",
    purple: "#a855f7",
    emerald: "#10b981",
    teal: "#14b8a6",
    amber: "#f59e0b",
    rose: "#f43f5e",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
  },
  dark: {
    primary: "#3b82f6",
    page: "#0f172a",
    card: "#1e293b",
    border: "#334155",
    textMain: "#f3f4f6",
    textSub: "#94a3b8",
    textMuted: "#64748b",
  },
};

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeConfig, setThemeConfig] = useState(DEFAULT_THEME_CONFIG);

  // --- 1. Load Settings on Mount ---
  useEffect(() => {
    const savedConfig = localStorage.getItem("themeConfigV2");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
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

    const css = `
      :root {
        --color-primary: ${config.light.primary};
        --color-page: ${config.light.page};
        --color-card: ${config.light.card};
        --color-border: ${config.light.border};
        --color-text-main: ${config.light.textMain};
        --color-text-sub: ${config.light.textSub};
        --color-text-muted: ${config.light.textMuted};
        --color-indigo: ${config.light.indigo};
        --color-purple: ${config.light.purple};
        --color-emerald: ${config.light.emerald};
        --color-teal: ${config.light.teal};
        --color-amber: ${config.light.amber};
        --color-rose: ${config.light.rose};
        --color-success: ${config.light.success};
        --color-danger: ${config.light.danger};
        --color-warning: ${config.light.warning};
        --color-input-bg: ${config.light.page};
        --color-input-border: ${config.light.border};
        --color-input-focus: ${config.light.primary};
      }

      .dark {
        --color-primary: ${config.dark.primary};
        --color-page: ${config.dark.page};
        --color-card: ${config.dark.card};
        --color-border: ${config.dark.border};
        --color-text-main: ${config.dark.textMain};
        --color-text-sub: ${config.dark.textSub};
        --color-text-muted: ${config.dark.textMuted};
        --color-input-bg: ${config.dark.page};
        --color-input-border: ${config.dark.border};
      }
    `;

    styleTag.innerHTML = css;
  };

  // --- 3. Handlers ---
  const handleThemeColorChange = (mode, key, value) => {
    const newConfig = {
      ...themeConfig,
      [mode]: {
        ...themeConfig[mode],
        [key]: value,
      },
    };
    applyThemeStyles(newConfig);
    setThemeConfig(newConfig);
  };

  const handleResetThemeColors = () => {
    if (window.confirm("Reset theme colors to default?")) {
      setThemeConfig(DEFAULT_THEME_CONFIG);
      applyThemeStyles(DEFAULT_THEME_CONFIG);
      localStorage.removeItem("themeConfigV2");
      toast.success("Theme colors reset to default.");
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("themeConfigV2", JSON.stringify(themeConfig));
      setSaving(false);
      toast.success("Theme settings saved successfully!");
    }, 500);
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-page)" }}
      >
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8 w-full text-[var(--color-text-main)] font-sans pb-24 transition-colors duration-300"
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
              onClick={handleResetThemeColors}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-text-sub)] bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-page)] transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
              {/* Base Colors */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Base Colors
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "primary", label: "Primary Brand" },
                    { key: "page", label: "Page Background" },
                    { key: "card", label: "Card Background" },
                    { key: "border", label: "Borders" },
                    { key: "textMain", label: "Main Text" },
                    { key: "textSub", label: "Secondary Text" },
                  ].map((item) => (
                    <ColorInput
                      key={item.key}
                      label={item.label}
                      value={themeConfig.light[item.key]}
                      onChange={(val) =>
                        handleThemeColorChange("light", item.key, val)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Accents */}
              <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Accents & Status
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "emerald", label: "Emerald" },
                    { key: "indigo", label: "Indigo" },
                    { key: "purple", label: "Purple" },
                    { key: "teal", label: "Teal" },
                    { key: "amber", label: "Amber" },
                    { key: "rose", label: "Rose" },
                  ].map((item) => (
                    <ColorInput
                      key={item.key}
                      label={item.label}
                      value={themeConfig.light[item.key]}
                      onChange={(val) =>
                        handleThemeColorChange("light", item.key, val)
                      }
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- DARK MODE SETTINGS --- */}
          <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Dark Mode Overrides</h2>
            </div>

            <div className="space-y-6">
              {/* Base Colors (Dark) */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Base Colors (Dark)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "primary", label: "Primary Brand (Dark)" },
                    { key: "page", label: "Page Background (Dark)" },
                    { key: "card", label: "Card Background (Dark)" },
                    { key: "border", label: "Borders (Dark)" },
                    { key: "textMain", label: "Main Text (Dark)" },
                    { key: "textSub", label: "Secondary Text (Dark)" },
                  ].map((item) => (
                    <ColorInput
                      key={item.key}
                      label={item.label}
                      value={themeConfig.dark[item.key]}
                      onChange={(val) =>
                        handleThemeColorChange("dark", item.key, val)
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
const ColorInput = ({ label, value, onChange, compact }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-white dark:bg-slate-800 hover:border-[var(--color-primary)] transition-all ${compact ? "flex-col" : ""}`}
  >
    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border-2 border-[var(--color-border)] cursor-pointer group">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
      />
    </div>
    <div className={`flex-1 min-w-0 ${compact ? "text-center" : ""}`}>
      <p
        className={`text-xs font-semibold text-[var(--color-text-main)] ${compact ? "mb-0" : "mb-1"}`}
      >
        {label}
      </p>
      <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
        {value}
      </p>
    </div>
  </div>
);

export default Settings;
