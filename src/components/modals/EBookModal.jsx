import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  BookOpen,
  Layers,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";

// Services
import eBookService from "../../api/eBookService";
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";

const EBOOK_CONTENT_TYPE = "E_BOOK";

const EBookModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    description: "",
    accessType: "FREE",
    isActive: true,
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
  });

  // Files
  const [files, setFiles] = useState({ thumbnail: null, bookFile: null });
  const [previews, setPreviews] = useState({ thumbnail: null });

  // --- INIT ---
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
    setFormData({
      name: data.name || "",
      startDate: data.startDate ? data.startDate.split("T")[0] : "",
      description: data.description || "",
      accessType: data.accessType || "FREE",
      isActive: data.isActive ?? true,
      // Map objects to IDs for dropdowns
      categoryIds: data.categories?.map((c) => c._id || c) || [],
      subCategoryIds: data.subCategories?.map((s) => s._id || s) || [],
      languageIds: data.languages?.map((l) => l._id || l) || [],
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
      languageIds: [],
    });
    setFiles({ thumbnail: null, bookFile: null });
    setPreviews({ thumbnail: null });
    setActiveTab("basic");
  };

  // --- LOADERS ---
  const loadDropdowns = async () => {
    try {
      const [catRes, langRes] = await Promise.all([
        categoryService.getAll(EBOOK_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(langRes.data.map((l) => ({ label: l.name, value: l._id })));
    } catch (e) {
      console.error(e);
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
        // Fetch based on first selected category (assuming single selection logic for now)
        const firstCatId = Array.isArray(formData.categoryIds)
          ? formData.categoryIds[0]
          : formData.categoryIds;
        const res = await subCategoryService.getAll(
          EBOOK_CONTENT_TYPE,
          firstCatId,
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

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelect = (field, val) => {
    // Wrap in array for model compatibility
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(val) ? val : [val],
    }));
  };

  const handleFile = (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      if (key === "thumbnail")
        setPreviews((prev) => ({
          ...prev,
          thumbnail: URL.createObjectURL(file),
        }));
    }
  };

  // --- API ACTIONS (EDIT MODE) ---

  const handleUpdateFile = async (type) => {
    if (!initialData?._id) return;
    try {
      setIsSubmitting(true);
      const data = new FormData();
      if (type === "thumbnail" && files.thumbnail)
        data.append("thumbnail", files.thumbnail);
      else if (type === "book" && files.bookFile)
        data.append("bookFile", files.bookFile);

      const res = await (type === "thumbnail"
        ? eBookService.updateThumbnail(initialData._id, data)
        : eBookService.updateBook(initialData._id, data));

      if (type === "thumbnail")
        setPreviews((p) => ({ ...p, thumbnail: res.data.thumbnailUrl }));
      toast.success(
        `${type === "thumbnail" ? "Thumbnail" : "Book file"} updated!`,
      );
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Specific handler for classification updates in Edit Mode
  const handleUpdateClassification = async () => {
    if (!initialData?._id) return;
    try {
      setIsSubmitting(true);
      const payload = {
        categories: formData.categoryIds,
        subCategories: formData.subCategoryIds,
        // Note: 'languages' might need a separate call or route update if not handled by updateCategories
        // Assuming backend handles it or we stick to allowed fields
      };
      await eBookService.updateCategories(initialData._id, payload);
      toast.success("Classification updated!");
    } catch (e) {
      toast.error("Failed to update classification");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MAIN SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      // Edit Mode: Send basic text fields via PATCH
      // File/Category updates are handled separately via buttons
      onSubmit({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        isActive: formData.isActive,
        accessType: formData.accessType,
        _isEdit: true,
      });
    } else {
      // Create Mode: Send everything via FormData
      const payload = { ...formData };
      const data = new FormData();
      data.append("ebook", JSON.stringify(payload));
      if (files.thumbnail) data.append("thumbnail", files.thumbnail);
      if (files.bookFile) data.append("bookFile", files.bookFile);
      onSubmit(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            {initialData ? "Edit E-Book" : "Create New E-Book"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50 shrink-0">
          {["basic", "classification", "files"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          <form id="ebook-form" onSubmit={handleSubmit} className="space-y-6">
            {/* --- BASIC TAB --- */}
            {activeTab === "basic" && (
              <div className="grid gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    E-Book Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Enter title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      Access Type
                    </label>
                    <select
                      name="accessType"
                      value={formData.accessType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium text-slate-600 cursor-pointer"
                    >
                      <option value="FREE">Free Access</option>
                      <option value="PAID">Paid Access</option>
                    </select>
                  </div>
                </div>

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

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                    />
                    <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <label
                    htmlFor="isActive"
                    className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                  >
                    Visible to Users
                  </label>
                </div>
              </div>
            )}

            {/* --- CLASSIFICATION TAB --- */}
            {activeTab === "classification" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomDropdown
                    label="Category"
                    options={categories}
                    value={formData.categoryIds?.[0]} // CustomDropdown expects single value typically
                    onChange={(v) => handleSelect("categoryIds", v)}
                    icon={Layers}
                    placeholder="Select Category"
                    required
                  />
                  <CustomDropdown
                    label="Sub Category"
                    options={subCategories}
                    value={formData.subCategoryIds?.[0]}
                    onChange={(v) => handleSelect("subCategoryIds", v)}
                    icon={Layers}
                    placeholder="Select Sub Category"
                    disabled={!formData.categoryIds?.length}
                    required
                  />
                  <CustomDropdown
                    label="Language"
                    options={languages}
                    value={formData.languageIds?.[0]}
                    onChange={(v) => handleSelect("languageIds", v)}
                    icon={FileText}
                    placeholder="Select Language"
                    required
                  />
                </div>

                {initialData && (
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={handleUpdateClassification}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> Update Classification
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* --- FILES TAB --- */}
            {activeTab === "files" && (
              <div className="space-y-6">
                {/* Thumbnail */}
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
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Supported formats: JPG, PNG, WEBP
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFile(e, "thumbnail")}
                        accept="image/*"
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-indigo-600 file:border-slate-200 file:border hover:file:bg-indigo-50 cursor-pointer"
                      />

                      {initialData && (
                        <button
                          type="button"
                          onClick={() => handleUpdateFile("thumbnail")}
                          disabled={isSubmitting || !files.thumbnail}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Update Thumbnail
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Book File */}
                <div className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-5">
                    <div className="w-24 h-24 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-green-600">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        E-Book File
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        {initialData?.bookFileUrl
                          ? "File currently uploaded."
                          : "No file uploaded yet."}{" "}
                        Upload PDF or EPUB.
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFile(e, "bookFile")}
                        accept=".pdf,.epub"
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-green-600 file:border-slate-200 file:border hover:file:bg-green-50 cursor-pointer"
                      />

                      {initialData && (
                        <button
                          type="button"
                          onClick={() => handleUpdateFile("book")}
                          disabled={isSubmitting || !files.bookFile}
                          className="mt-3 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Update Book File
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {initialData && (
                  <p className="text-center text-xs text-slate-400 italic flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" /> File updates are applied
                    immediately.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ebook-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />{" "}
            {initialData ? "Save Basic Info" : "Create E-Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EBookModal;
