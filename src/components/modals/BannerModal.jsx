import React, { useState, useEffect } from "react";
import {
  Loader2,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { saveBanner, fetchBanner } from "../../store/slices/bannerSlice";
import { bannerService } from "../../api/bannerService";
import ModalManager from "./ModalManager";

const BannerModal = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
  pageType = "HOME",
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [replacingId, setReplacingId] = useState(null);
  const [activeSection, setActiveSection] = useState("CONTENT"); // 'CONTENT' | 'DESIGN'

  // Content State
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  // Design State (Rich Defaults)
  const [styles, setStyles] = useState({
    headingColor: "#1e293b",
    descriptionColor: "#475569",
    overlayColor: "#000000",
    overlayOpacity: 20, // 0-100
    textAlign: "left",
  });

  // Init Data
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setHeading(editData.heading || "");
        setDescription(editData.description || "");
        setStyles({
          headingColor: editData.styleConfig?.headingColor || "#1e293b",
          descriptionColor: editData.styleConfig?.descriptionColor || "#475569",
          overlayColor: editData.styleConfig?.overlayColor || "#000000",
          overlayOpacity: editData.styleConfig?.overlayOpacity ?? 20,
          textAlign: editData.styleConfig?.textAlign || "left",
        });
      } else {
        // Reset Defaults
        setHeading("");
        setDescription("");
        setStyles({
          headingColor: "#1e293b",
          descriptionColor: "#475569",
          overlayColor: "#000000",
          overlayOpacity: 20,
          textAlign: "left",
        });
      }
      setFiles([]);
      setActiveSection("CONTENT");
    }
  }, [editData, isOpen]);

  // Submit Handler
  const handleMainSubmit = async (e) => {
    e.preventDefault();

    if (!editData && files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    if (pageType === "ABOUT" && (!heading.trim() || !description.trim())) {
      toast.error("Heading and Description are required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pageType", pageType);

      if (pageType === "ABOUT") {
        formData.append("heading", heading);
        formData.append("description", description);
      }

      // Send Styles
      formData.append("styleConfig", JSON.stringify(styles));

      // Send Images
      if (files.length > 0) {
        Array.from(files).forEach((file) => formData.append("images", file));
      }

      await dispatch(saveBanner({ formData, pageType })).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleImageReplace = async (imageId, file) => {
    if (!file) return;
    setReplacingId(imageId);
    const toastId = toast.loading("Optimizing & Uploading...");
    try {
      await bannerService.updateImage(pageType, imageId, file);
      toast.success("Image updated", { id: toastId });
      dispatch(fetchBanner(pageType));
    } catch (error) {
      toast.error("Update failed", { id: toastId });
    } finally {
      setReplacingId(null);
    }
  };

  return (
    <ModalManager
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? `Edit ${pageType} Banner` : `Create ${pageType} Banner`}
      pageName="BANNERS"
      modalType={editData ? "EDIT" : "CREATE"}
      size="lg"
    >
      <div className="flex flex-col h-[80vh] bg-slate-50/50">
        {/* --- 1. Rich Tabs --- */}
        <div className="px-6 pt-6 pb-2 bg-white border-b border-slate-100 flex gap-4 sticky top-0 z-20">
          <button
            onClick={() => setActiveSection("CONTENT")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeSection === "CONTENT"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Type className="w-4 h-4" /> Content & Images
          </button>
          <button
            onClick={() => setActiveSection("DESIGN")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeSection === "DESIGN"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" /> Style & Design
          </button>
        </div>

        {/* --- 2. Scrollable Content Area --- */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form
            id="richBannerForm"
            onSubmit={handleMainSubmit}
            className="space-y-8"
          >
            {/* ====== CONTENT TAB ====== */}
            {activeSection === "CONTENT" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* A. Existing Images Grid */}
                {editData && editData.images?.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Active Gallery
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {editData.images.map((img) => (
                        <div
                          key={img.uid}
                          className="group relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all"
                        >
                          <img
                            src={img.url}
                            alt="Banner Asset"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />

                          {/* Loading Overlay */}
                          {replacingId === img.uid && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                              <span className="text-xs font-semibold text-indigo-600">
                                Uploading...
                              </span>
                            </div>
                          )}

                          {/* Hover Action */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                            <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xl transform hover:scale-105">
                              <RefreshCw className="w-3.5 h-3.5" /> Replace
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                disabled={replacingId !== null}
                                onChange={(e) =>
                                  handleSingleImageReplace(
                                    img.uid,
                                    e.target.files[0],
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* B. Text Inputs (About Page) */}
                {pageType === "ABOUT" && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Text Content
                    </h3>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Heading Title
                      </label>
                      <input
                        type="text"
                        value={heading}
                        onChange={(e) => setHeading(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="e.g. Empowering Your Future"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-600 leading-relaxed"
                        placeholder="Write a compelling description..."
                      />
                    </div>
                  </div>
                )}

                {/* C. New Upload Zone */}
                <div className="group relative">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${files.length > 0 ? "border-indigo-400 bg-indigo-50/30" : "border-slate-300 hover:border-indigo-400 hover:bg-white"}`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="relative z-0 flex flex-col items-center gap-3">
                      <div
                        className={`p-3 rounded-full transition-colors ${files.length > 0 ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"}`}
                      >
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {files.length > 0
                            ? `${files.length} image(s) ready to upload`
                            : editData
                              ? "Upload New Set (Optional)"
                              : "Upload Banner Images"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {files.length > 0
                            ? "Click to change selection"
                            : "Supports JPG, PNG, WEBP • Max 5MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== DESIGN TAB ====== */}
            {activeSection === "DESIGN" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* A. Live Mini Preview */}
                <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-[21/9] flex flex-col justify-center px-8 transition-all">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-50"></div>
                    <div
                      className="absolute inset-0 transition-colors duration-300"
                      style={{
                        backgroundColor: styles.overlayColor,
                        opacity: styles.overlayOpacity / 100,
                      }}
                    ></div>

                    {/* Dynamic Text */}
                    <div
                      className="relative z-10 transition-all duration-300"
                      style={{ textAlign: styles.textAlign }}
                    >
                      <h1
                        className="text-2xl font-bold mb-2 leading-tight"
                        style={{ color: styles.headingColor }}
                      >
                        {heading || "Your Heading Title"}
                      </h1>
                      <p
                        className="text-sm opacity-90 leading-relaxed max-w-[80%]"
                        style={{
                          color: styles.descriptionColor,
                          marginLeft:
                            styles.textAlign === "center" ? "auto" : 0,
                          marginRight:
                            styles.textAlign === "center"
                              ? "auto"
                              : styles.textAlign === "right"
                                ? 0
                                : "auto",
                          marginLeft: styles.textAlign === "right" ? "auto" : 0,
                        }}
                      >
                        {description ||
                          "This is a live preview of how your text colors and alignment will appear on the banner."}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Live Style Preview
                    </span>
                  </div>
                </div>

                {/* B. Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colors Card */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Typography Colors
                    </h3>

                    {/* Heading Color */}
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <span className="text-sm font-medium text-slate-600">
                        Heading
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 uppercase">
                          {styles.headingColor}
                        </span>
                        <input
                          type="color"
                          value={styles.headingColor}
                          onChange={(e) =>
                            setStyles({
                              ...styles,
                              headingColor: e.target.value,
                            })
                          }
                          className="h-8 w-8 rounded-full border-2 border-white shadow-md cursor-pointer appearance-none p-0 overflow-hidden"
                        />
                      </div>
                    </div>

                    {/* Description Color */}
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <span className="text-sm font-medium text-slate-600">
                        Description
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 uppercase">
                          {styles.descriptionColor}
                        </span>
                        <input
                          type="color"
                          value={styles.descriptionColor}
                          onChange={(e) =>
                            setStyles({
                              ...styles,
                              descriptionColor: e.target.value,
                            })
                          }
                          className="h-8 w-8 rounded-full border-2 border-white shadow-md cursor-pointer appearance-none p-0 overflow-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Overlay & Alignment Card */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Layout & Overlay
                    </h3>

                    {/* Alignment Toggles */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">
                        Text Alignment
                      </label>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() =>
                              setStyles({ ...styles, textAlign: align })
                            }
                            className={`flex-1 py-1.5 rounded-md flex justify-center transition-all ${
                              styles.textAlign === align
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {align === "left" && <AlignLeft size={18} />}
                            {align === "center" && <AlignCenter size={18} />}
                            {align === "right" && <AlignRight size={18} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overlay Opacity Slider */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-500">
                          Overlay Opacity
                        </label>
                        <span className="text-xs font-bold text-indigo-600">
                          {styles.overlayOpacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={styles.overlayOpacity}
                        onChange={(e) =>
                          setStyles({
                            ...styles,
                            overlayOpacity: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Overlay Color */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-500">
                        Overlay Color
                      </label>
                      <input
                        type="color"
                        value={styles.overlayColor}
                        onChange={(e) =>
                          setStyles({ ...styles, overlayColor: e.target.value })
                        }
                        className="h-6 w-12 rounded border border-slate-200 cursor-pointer p-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* --- 3. Footer Actions --- */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            form="richBannerForm"
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {editData ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </div>
    </ModalManager>
  );
};

export default BannerModal;
