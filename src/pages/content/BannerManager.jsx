import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBanner,
  saveBanner,
  addBannerImages,
  deleteBannerImage,
} from "../../store/slices/bannerSlice";
import { bannerService } from "../../api/bannerService";
import toast from "react-hot-toast";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  Layout,
  Type,
} from "lucide-react";
import FeatureCardEditor from "../../components/content/FeatureCardEditor";

const BannerManager = () => {
  const dispatch = useDispatch();
  const addImageInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("HOME");
  const [isSaving, setIsSaving] = useState(false);
  const [replacingId, setReplacingId] = useState(null);

  const { homeBanner, aboutBanner, isLoading } = useSelector(
    (state) => state.banners,
  );
  const currentBanner = activeTab === "HOME" ? homeBanner : aboutBanner;

  // Local State for Editing (Initialize empty)
  const [formData, setFormData] = useState({
    heading: "",
    description: "",
    secondaryTitle: "",
    featureCards: [],
    styleConfig: {
      headingColor: "#1e293b",
      descriptionColor: "#475569",
      secondaryTitleColor: "#1e293b",
    },
  });

  // 1. Load Data on Tab Change
  useEffect(() => {
    dispatch(fetchBanner(activeTab));
  }, [activeTab, dispatch]);

  // 2. Sync Redux Data to Local State
  useEffect(() => {
    if (currentBanner) {
      setFormData({
        heading: currentBanner.heading || "",
        description: currentBanner.description || "",
        secondaryTitle: currentBanner.secondaryTitle || "",
        featureCards: currentBanner.featureCards || [],
        styleConfig: {
          headingColor: currentBanner.styleConfig?.headingColor || "#1e293b",
          descriptionColor:
            currentBanner.styleConfig?.descriptionColor || "#475569",
          secondaryTitleColor:
            currentBanner.styleConfig?.secondaryTitleColor || "#1e293b",
        },
      });
    } else {
      // Defaults if no banner exists
      setFormData({
        heading: "",
        description: "",
        secondaryTitle: "",
        featureCards: [],
        styleConfig: {
          headingColor: "#1e293b",
          descriptionColor: "#475569",
          secondaryTitleColor: "#1e293b",
        },
      });
    }
  }, [currentBanner]);

  // --- HANDLERS ---

  const handleTextChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStyleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      styleConfig: { ...prev.styleConfig, [field]: value },
    }));
  };

  const handleCardsChange = (newCards) => {
    setFormData((prev) => ({ ...prev, featureCards: newCards }));
  };

  // A. SAVE TEXT & SETTINGS
  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append("pageType", activeTab);
      data.append("heading", formData.heading);
      data.append("description", formData.description);
      data.append("secondaryTitle", formData.secondaryTitle);
      data.append("featureCards", JSON.stringify(formData.featureCards));
      data.append("styleConfig", JSON.stringify(formData.styleConfig));

      await dispatch(
        saveBanner({ formData: data, pageType: activeTab }),
      ).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // B. ADD NEW IMAGES (Append to list)
  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const data = new FormData();
    data.append("pageType", activeTab);
    files.forEach((f) => data.append("images", f));

    await dispatch(addBannerImages({ formData: data, pageType: activeTab }));
    e.target.value = ""; // Reset input
  };

  // C. REPLACE SINGLE IMAGE
  const handleReplaceImage = async (imageId, file) => {
    if (!file) return;
    setReplacingId(imageId);
    const toastId = toast.loading("Replacing image...");
    try {
      await bannerService.updateImage(activeTab, imageId, file);
      toast.success("Image replaced", { id: toastId });
      dispatch(fetchBanner(activeTab));
    } catch (error) {
      toast.error("Failed to replace", { id: toastId });
    } finally {
      setReplacingId(null);
    }
  };

  // D. DELETE SINGLE IMAGE
  const handleDeleteImage = async (imageId) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await dispatch(deleteBannerImage({ pageType: activeTab, imageId }));
    }
  };

  if (isLoading && !currentBanner)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Page Content Manager
            </h1>
            <p className="text-slate-500 text-sm">
              Manage banners, images, and feature sections.
            </p>
          </div>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200">
            {["HOME", "ABOUT"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* === LEFT: EDITOR === */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. IMAGES CARD */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Layout size={18} /> Image Gallery
                </h3>
                <button
                  onClick={() => addImageInputRef.current.click()}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Add Image
                </button>
                <input
                  type="file"
                  multiple
                  ref={addImageInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleAddImages}
                />
              </div>

              {currentBanner?.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {currentBanner.images.map((img) => (
                    <div
                      key={img._id}
                      className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200"
                    >
                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                      />

                      {/* Controls Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-2 bg-white rounded-full text-slate-700 hover:text-indigo-600 cursor-pointer shadow-lg hover:scale-110 transition-transform">
                          <RefreshCw
                            size={16}
                            className={
                              replacingId === img._id ? "animate-spin" : ""
                            }
                          />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            disabled={replacingId !== null}
                            onChange={(e) =>
                              handleReplaceImage(img._id, e.target.files[0])
                            }
                          />
                        </label>
                        <button
                          onClick={() => handleDeleteImage(img._id)}
                          className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600 shadow-lg hover:scale-110 transition-transform"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-400">No images yet.</p>
                </div>
              )}
            </div>

            {/* 2. CONTENT EDITING */}
            <form className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Type size={18} /> Page Content
              </h3>

              {/* Main Title */}
              <div>
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Main Heading
                  </label>
                  <input
                    type="color"
                    value={formData.styleConfig.headingColor}
                    onChange={(e) =>
                      handleStyleChange("headingColor", e.target.value)
                    }
                    className="w-5 h-5 cursor-pointer rounded border-none p-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => handleTextChange("heading", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  placeholder="e.g. Welcome to Brain Buzz"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Main Description
                  </label>
                  <input
                    type="color"
                    value={formData.styleConfig.descriptionColor}
                    onChange={(e) =>
                      handleStyleChange("descriptionColor", e.target.value)
                    }
                    className="w-5 h-5 cursor-pointer rounded border-none p-0 bg-transparent"
                  />
                </div>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleTextChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                  placeholder="Enter detailed description..."
                />
              </div>

              {/* Secondary Title (About Page Only) */}
              {activeTab === "ABOUT" && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">
                      Secondary Title
                    </label>
                    <input
                      type="color"
                      value={formData.styleConfig.secondaryTitleColor}
                      onChange={(e) =>
                        handleStyleChange("secondaryTitleColor", e.target.value)
                      }
                      className="w-5 h-5 cursor-pointer rounded border-none p-0 bg-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.secondaryTitle}
                    onChange={(e) =>
                      handleTextChange("secondaryTitle", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    placeholder="e.g. Everything you need to know"
                  />
                </div>
              )}
            </form>

            {/* 3. FEATURE CARDS (About Only) */}
            {activeTab === "ABOUT" && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                  <Layers size={18} /> Feature Sections
                </h3>
                <FeatureCardEditor
                  cards={formData.featureCards}
                  onChange={handleCardsChange}
                />
              </div>
            )}

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveContent}
              disabled={isSaving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95 sticky bottom-6 z-10"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Save All Content
            </button>
          </div>

          {/* === RIGHT: LIVE PREVIEW === */}
          <div className="lg:col-span-7 sticky top-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg text-slate-700">
                Live Website Preview
              </h2>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                Real-time
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
              {/* Browser Bar */}
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <div className="bg-white border text-xs text-slate-400 px-3 py-0.5 rounded-md flex-1">
                  brainbuzz.app/{activeTab.toLowerCase()}
                </div>
              </div>

              {/* --- PREVIEW CONTENT --- */}
              <div className="p-8">
                {/* 1. Images Row */}
                <div
                  className={`grid gap-4 mb-8 ${activeTab === "HOME" ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {currentBanner?.images?.length > 0 ? (
                    currentBanner.images.map((img, i) => (
                      <div
                        key={i}
                        className={`rounded-xl overflow-hidden bg-slate-100 shadow-sm ${activeTab === "HOME" ? "aspect-[21/9]" : "aspect-video"}`}
                      >
                        <img
                          src={img.url}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="h-40 bg-slate-50 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300">
                      No Images
                    </div>
                  )}
                </div>

                {/* 2. Main Text */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2
                    className="text-3xl font-bold mb-4"
                    style={{ color: formData.styleConfig.headingColor }}
                  >
                    {formData.heading || "Main Heading"}
                  </h2>
                  <p
                    className="text-lg leading-relaxed whitespace-pre-wrap"
                    style={{ color: formData.styleConfig.descriptionColor }}
                  >
                    {formData.description || "Description content goes here..."}
                  </p>
                </div>

                {/* 3. Secondary Title & Features (About Only) */}
                {activeTab === "ABOUT" && (
                  <div className="text-center">
                    <h3
                      className="text-xl font-bold mb-8"
                      style={{
                        color: formData.styleConfig.secondaryTitleColor,
                      }}
                    >
                      {formData.secondaryTitle || "Secondary Section Title"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      {formData.featureCards.length > 0 ? (
                        formData.featureCards.map((card, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl flex items-start gap-4"
                            style={{ backgroundColor: card.color }}
                          >
                            <div className="p-2 bg-white/50 rounded-lg">
                              {/* Just a placeholder icon for preview */}
                              <div className="w-6 h-6 bg-slate-800 rounded-full opacity-20"></div>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">
                                {card.title}
                              </h4>
                              <p className="text-sm text-slate-700 opacity-80 leading-snug mt-1">
                                {card.description}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-slate-300 italic">
                          No feature cards added
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManager;
