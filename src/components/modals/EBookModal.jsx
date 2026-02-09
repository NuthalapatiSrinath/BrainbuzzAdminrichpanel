import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Upload,
  BookOpen,
  Layers,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";
import DatePicker from "../common/DatePicker";

// Services
import eBookService from "../../api/eBookService";
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";

const EBOOK_CONTENT_TYPE = "E_BOOK";

const EBookModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdowns Data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    description: "",
    accessType: "FREE", // Default to FREE as per requirement
    isActive: true,
    categoryIds: [],
    subCategoryIds: [],
    languageId: "", // Changed to single language
  });

  // Files & Previews
  const [files, setFiles] = useState({ thumbnail: null, bookFile: null });
  const [previews, setPreviews] = useState({ thumbnail: null });

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        populateForm(initialData);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const populateForm = (data) => {
    const formattedDate = data.startDate
      ? new Date(data.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    setFormData({
      name: data.name || "",
      startDate: formattedDate,
      description: data.description || "",
      accessType: "FREE", // Force FREE
      isActive: data.isActive ?? true,
      categoryIds: data.categories?.map((c) => c._id || c) || [],
      subCategoryIds: data.subCategories?.map((s) => s._id || s) || [],
      languageId: data.languages?.[0]?._id || data.languages?.[0] || "", // Single language
    });
    setPreviews({ thumbnail: data.thumbnailUrl });
    setFiles({ thumbnail: null, bookFile: null });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startDate: new Date().toISOString().split("T")[0],
      description: "",
      accessType: "FREE",
      isActive: true,
      categoryIds: [],
      subCategoryIds: [],
      languageId: "", // Single language
    });
    setFiles({ thumbnail: null, bookFile: null });
    setPreviews({ thumbnail: null });
    setActiveTab("basic");
  };

  // --- 2. LOADERS ---
  const loadDropdowns = async () => {
    try {
      const [catRes, langRes] = await Promise.all([
        categoryService.getAll(EBOOK_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      // Store full language objects for the multi-select UI
      setLanguages(langRes.data);
    } catch (e) {
      console.error("Failed to load dropdowns", e);
      toast.error("Error loading options");
    }
  };

  // Dependent SubCategory Fetch
  useEffect(() => {
    const loadSub = async () => {
      if (!formData.categoryIds?.length) {
        setSubCategories([]);
        return;
      }
      try {
        const selectedCatId = Array.isArray(formData.categoryIds)
          ? formData.categoryIds[0]
          : formData.categoryIds;

        if (!selectedCatId) return;

        const res = await subCategoryService.getAll(
          EBOOK_CONTENT_TYPE,
          selectedCatId,
        );
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadSub();
  }, [formData.categoryIds]);

  // --- 3. HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Custom DatePicker Handler
  const handleDateChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDropdownChange = (field, value) => {
    const arrayValue = Array.isArray(value) ? value : [value];
    setFormData((prev) => {
      const updates = { ...prev, [field]: arrayValue };
      if (field === "categoryIds") updates.subCategoryIds = [];
      return updates;
    });
  };

  // Single-Select Handler for Language
  const handleLanguageChange = (langId) => {
    setFormData((prev) => ({
      ...prev,
      languageId: langId,
    }));
  };

  const handleFile = (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      if (key === "thumbnail") {
        setPreviews((prev) => ({
          ...prev,
          thumbnail: URL.createObjectURL(file),
        }));
      }
    }
  };

  // --- 4. API ACTIONS (EDIT MODE DIRECT UPDATES) ---

  const handleUpdateFile = async (type) => {
    if (!initialData?._id) return;
    const loadingToast = toast.loading(`Uploading ${type}...`);

    try {
      setIsSubmitting(true);
      let res;
      if (type === "thumbnail" && files.thumbnail) {
        res = await eBookService.updateThumbnail(
          initialData._id,
          files.thumbnail,
        );

        // Validate response
        if (!res.data?.thumbnailUrl) {
          toast.error(
            "❌ Thumbnail upload failed: No URL returned from server",
            {
              id: loadingToast,
              duration: 5000,
            },
          );
          return;
        }

        setPreviews((p) => ({ ...p, thumbnail: res.data.thumbnailUrl }));
        setFiles((p) => ({ ...p, thumbnail: null }));
      } else if (type === "book" && files.bookFile) {
        res = await eBookService.updateBook(initialData._id, files.bookFile);

        // Validate response
        if (!res.data?.bookFileUrl) {
          toast.error(
            "❌ Book file upload failed: No URL returned from server",
            {
              id: loadingToast,
              duration: 5000,
            },
          );
          return;
        }

        setFiles((p) => ({ ...p, bookFile: null }));
      }

      toast.success(res?.message || `${type} updated successfully!`, {
        id: loadingToast,
      });

      if (onSubmit && res?.data) {
        onSubmit({ _isEdit: true, _refreshOnly: true });
      }
    } catch (e) {
      console.error("[EBookModal] File upload failed:", e);
      // Error toast handled by axios interceptor, but dismiss loading toast
      toast.dismiss(loadingToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClassification = async () => {
    if (!initialData?._id) return;
    console.log("[EBookModal] Updating classification with:", {
      categoryIds: formData.categoryIds,
      subCategoryIds: formData.subCategoryIds,
      note: "Language NOT sent - backend doesn't support updating it",
    });
    const loadingToast = toast.loading("Updating classification...");

    try {
      setIsSubmitting(true);

      // Update Categories & SubCategories only (backend doesn't support language updates)
      const res = await eBookService.updateCategories(
        initialData._id,
        formData.categoryIds,
        formData.subCategoryIds,
      );

      console.log(
        "[EBookModal] Classification updated successfully:",
        res.data,
      );

      // ⚠️ VALIDATE RESPONSE
      const responseData = res.data;
      const errors = [];

      if (formData.categoryIds.length !== responseData.categories?.length) {
        errors.push(
          `Categories: Sent ${formData.categoryIds.length}, Got ${responseData.categories?.length || 0}`,
        );
      }

      if (
        formData.subCategoryIds.length !== responseData.subCategories?.length
      ) {
        errors.push(
          `SubCategories: Sent ${formData.subCategoryIds.length}, Got ${responseData.subCategories?.length || 0}`,
        );
      }

      // Note: Language validation removed - backend doesn't support updating languages

      if (errors.length > 0) {
        console.error("[EBookModal] Backend response mismatch:", errors);
        toast.error(`⚠️ Update incomplete!\n${errors.join("\n")}`, {
          id: loadingToast,
          duration: 6000,
        });
        return;
      }

      toast.success("Classification updated successfully!", {
        id: loadingToast,
      });

      if (onSubmit && res?.data) {
        onSubmit({ _isEdit: true, _refreshOnly: true });
      }
    } catch (e) {
      console.error("[EBookModal] Failed to update classification:", e);
      toast.dismiss(loadingToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. MAIN SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) return toast.error("E-Book Name is required");
    if (!formData.categoryIds?.length && !initialData)
      return toast.error("Category is required");

    // Force FREE access type
    const payload = {
      ...formData,
      accessType: "FREE",
      languageIds: formData.languageId ? [formData.languageId] : [], // Convert single to array for backend
    };

    if (initialData) {
      // Edit Basic Info
      onSubmit({
        name: payload.name,
        description: payload.description,
        startDate: payload.startDate,
        isActive: payload.isActive,
        _isEdit: true,
      });
    } else {
      // Create New
      const data = new FormData();
      data.append("ebook", JSON.stringify(payload));
      if (files.thumbnail) data.append("thumbnail", files.thumbnail);
      if (files.bookFile) data.append("bookFile", files.bookFile);

      onSubmit(data);
    }
  };

  // Options for Dropdowns
  const categoryOptions = useMemo(() => categories, [categories]);
  const subCategoryOptions = useMemo(() => subCategories, [subCategories]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* --- Header --- */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 text-white rounded-t-2xl"
          style={{ background: "var(--color-brand-blue)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">
              {initialData ? "Edit E-Book" : "Create New E-Book"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Tabs --- */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
          {[
            { id: "basic", label: "Basic Info", icon: FileText },
            ...(initialData
              ? [
                  {
                    id: "classification",
                    label: "Classification",
                    icon: Layers,
                  },
                  { id: "files", label: "Files", icon: Upload },
                ]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-bold capitalize transition-all flex items-center justify-center gap-2 relative ${
                activeTab === tab.id
                  ? "text-[var(--color-brand-blue)] bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                  style={{ background: "var(--color-brand-blue)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* --- Body --- */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          <form id="ebook-form" onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC TAB */}
            {activeTab === "basic" && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      E-Book Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                      placeholder="Enter e-book title"
                      required
                    />
                  </div>

                  {/* Start Date - Using Custom DatePicker */}
                  <div>
                    <DatePicker
                      label="Start Date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleDateChange}
                      placeholder="Select publish date"
                    />
                  </div>

                  {/* Category (Create Mode Only) */}
                  {!initialData && (
                    <div>
                      <CustomDropdown
                        label="Category *"
                        options={categoryOptions}
                        value={formData.categoryIds?.[0]}
                        onChange={(v) => handleDropdownChange("categoryIds", v)}
                        placeholder="Select Category"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Classification (Create Mode Only) */}
                {!initialData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomDropdown
                      label="Sub Category"
                      options={subCategoryOptions}
                      value={formData.subCategoryIds?.[0]}
                      onChange={(v) =>
                        handleDropdownChange("subCategoryIds", v)
                      }
                      placeholder="Select Sub Category"
                      disabled={!formData.categoryIds?.length}
                    />

                    {/* Language Single Select UI */}
                    <div className="md:col-span-2">
                      <CustomDropdown
                        label={
                          initialData
                            ? "Language (Set at Creation)"
                            : "Language"
                        }
                        options={languages.map((l) => ({
                          label: l.name,
                          value: l._id,
                        }))}
                        value={formData.languageId}
                        onChange={(v) => handleLanguageChange(v)}
                        icon={FileText}
                        placeholder="Select Language"
                        disabled={!!initialData}
                        required
                      />
                      {initialData && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Language cannot be
                          changed after creation
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all resize-none text-slate-600"
                    placeholder="Write a short description..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 accent-green-600 cursor-pointer"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                  >
                    Visible to Users (Publish)
                  </label>
                </div>

                {!initialData && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> You can upload files after
                    creating the basic details.
                  </div>
                )}
              </div>
            )}

            {/* 2. CLASSIFICATION TAB (Edit Mode Only) */}
            {activeTab === "classification" && initialData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomDropdown
                    label="Category"
                    options={categoryOptions}
                    value={formData.categoryIds?.[0]}
                    onChange={(v) => handleDropdownChange("categoryIds", v)}
                    icon={Layers}
                    placeholder="Select Category"
                    required
                  />
                  <CustomDropdown
                    label="Sub Category"
                    options={subCategoryOptions}
                    value={formData.subCategoryIds?.[0]}
                    onChange={(v) => handleDropdownChange("subCategoryIds", v)}
                    icon={Layers}
                    placeholder={
                      formData.categoryIds?.length
                        ? "Select Sub Category"
                        : "Select Category First"
                    }
                    disabled={!formData.categoryIds?.length}
                    required
                  />
                </div>

                {/* Language Single Select - Display Only in Edit Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Language (Set at Creation)
                  </label>
                  <CustomDropdown
                    label=""
                    options={languages.map((l) => ({
                      label: l.name,
                      value: l._id,
                    }))}
                    value={formData.languageId}
                    onChange={(v) => handleLanguageChange(v)}
                    icon={FileText}
                    placeholder="Select Language"
                    disabled={true}
                    required
                  />
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Language cannot be
                    changed after creation
                  </p>
                </div>

                {/* Update Button - Single button for all classification */}
                <div className="flex pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleUpdateClassification}
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Update Classification
                  </button>
                </div>
              </div>
            )}

            {/* 3. FILES TAB (Edit Mode Only) */}
            {activeTab === "files" && initialData && (
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <div className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-5">
                    <div className="w-24 h-24 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {previews.thumbnail ? (
                        <img
                          src={previews.thumbnail}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        Thumbnail Image
                      </h4>
                      <input
                        type="file"
                        onChange={(e) => handleFile(e, "thumbnail")}
                        accept="image/*"
                        className="block w-full text-xs text-slate-500 mt-2 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-indigo-600 border rounded cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateFile("thumbnail")}
                        disabled={isSubmitting || !files.thumbnail}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin w-3 h-3" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        Update Thumbnail
                      </button>
                    </div>
                  </div>
                </div>

                {/* Book File Upload */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/30">
                  <div className="flex items-start gap-5">
                    <div className="w-24 h-24 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-green-600">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        E-Book File
                      </h4>
                      <div className="text-xs text-slate-500 mt-1 mb-2">
                        {initialData?.bookFileUrl
                          ? "📄 Current file uploaded"
                          : "⚠️ No file uploaded"}
                      </div>

                      <input
                        type="file"
                        onChange={(e) => handleFile(e, "bookFile")}
                        accept=".pdf,.epub"
                        className="block w-full text-xs text-slate-500 mt-2 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-green-600 border rounded cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateFile("book")}
                        disabled={isSubmitting || !files.bookFile}
                        className="mt-3 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin w-3 h-3" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        Update Book File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>

          {/* Main Submit Button - Only visible on Basic Tab for Edits, or always for Creates */}
          {(activeTab === "basic" || !initialData) && (
            <button
              type="submit"
              form="ebook-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-70"
              style={{ background: "var(--color-brand-blue)" }}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? "Save Basic Info" : "Create E-Book"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EBookModal;
