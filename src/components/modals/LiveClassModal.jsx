import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Video,
  Calendar,
  Layers,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Youtube,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";

// Services
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";

const LIVE_CLASS_CONTENT_TYPE = "LIVE_CLASS";

const LiveClassModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    videoLink: "",
    dateTime: "",
    categoryId: "",
    subCategoryId: "",
    languageId: "",
    isActive: true,
    accessType: "PAID",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Init
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      initialData ? populateForm(initialData) : resetForm();
    }
  }, [isOpen, initialData]);

  const populateForm = (data) => {
    setFormData({
      name: data.name || "",
      description: data.description || "",
      videoLink: data.videoLink || "",
      dateTime: data.dateTime
        ? new Date(data.dateTime).toISOString().slice(0, 16)
        : "",
      categoryId: data.categoryId?._id || data.categoryId || "",
      subCategoryId: data.subCategoryId?._id || data.subCategoryId || "",
      languageId: data.languageId?._id || data.languageId || "",
      isActive: data.isActive ?? true,
      accessType: data.accessType || "PAID",
    });
    setPreview(data.thumbnail);
    setFile(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      videoLink: "",
      dateTime: "",
      categoryId: "",
      subCategoryId: "",
      languageId: "",
      isActive: true,
      accessType: "PAID",
    });
    setFile(null);
    setPreview(null);
    setActiveTab("basic");
  };

  const loadDropdowns = async () => {
    try {
      const [catRes, langRes] = await Promise.all([
        categoryService.getAll(LIVE_CLASS_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(langRes.data.map((l) => ({ label: l.name, value: l._id })));
    } catch (e) {
      console.error(e);
    }
  };

  // Dependent SubCategory
  useEffect(() => {
    const loadSub = async () => {
      if (!formData.categoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await subCategoryService.getAll(
          LIVE_CLASS_CONTENT_TYPE,
          formData.categoryId,
        );
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadSub();
  }, [formData.categoryId]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleDropdown = (field, val) =>
    setFormData((p) => ({ ...p, [field]: val }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (file) data.append("thumbnail", file);
    onSubmit(data).finally(() => setIsSubmitting(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <Video className="w-5 h-5" />
            </div>
            {initialData ? "Edit Live Class" : "Schedule Live Class"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50">
          {["basic", "details", "classification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold capitalize border-b-2 transition-all ${activeTab === tab ? "border-rose-600 text-rose-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          <form id="live-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "basic" && (
              <div className="grid gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Class Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-500 transition-all font-medium"
                    placeholder="e.g. Current Affairs Daily Analysis"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        name="dateTime"
                        value={formData.dateTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-600 font-medium"
                        required
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
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-500 bg-white font-medium text-slate-600"
                    >
                      <option value="PAID">Paid (Enrolled Only)</option>
                      <option value="FREE">Free (Open to All)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Video Link (YouTube/Zoom){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-blue-600 font-medium"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-500 resize-none"
                    placeholder="What will be covered in this class?"
                  />
                </div>

                <div className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/30">
                  <div className="flex items-start gap-5">
                    <div className="w-24 h-24 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
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
                        Upload class thumbnail (JPG, PNG)
                      </p>
                      <input
                        type="file"
                        onChange={handleFile}
                        accept="image/*"
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-rose-600 file:border-slate-200 file:border hover:file:bg-rose-50 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-rose-600 checked:bg-rose-600 transition-all"
                    />
                    <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <label
                    htmlFor="isActive"
                    className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                  >
                    Class is Active (Visible to students)
                  </label>
                </div>
              </div>
            )}

            {activeTab === "classification" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomDropdown
                  label="Category"
                  options={categories}
                  value={formData.categoryId}
                  onChange={(v) => handleDropdown("categoryId", v)}
                  icon={Layers}
                  placeholder="Select Category"
                  required
                />
                <CustomDropdown
                  label="Sub Category"
                  options={subCategories}
                  value={formData.subCategoryId}
                  onChange={(v) => handleDropdown("subCategoryId", v)}
                  icon={Layers}
                  placeholder="Select Sub Category"
                  disabled={!formData.categoryId}
                  required
                />
                <CustomDropdown
                  label="Language"
                  options={languages}
                  value={formData.languageId}
                  onChange={(v) => handleDropdown("languageId", v)}
                  icon={FileText}
                  placeholder="Select Language"
                  required
                />
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
            form="live-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />{" "}
            {initialData ? "Save Changes" : "Schedule Class"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveClassModal;
