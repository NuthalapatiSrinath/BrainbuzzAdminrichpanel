import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  Calendar,
  Layers,
  Type,
  BookOpen,
  Globe,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import CustomDropdown from "../common/CustomDropdown";
import MultiSelect from "../common/MultiSelect";
import DatePicker from "../common/DatePicker";

// Services
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";

const CURRENT_AFFAIRS_CONTENT_TYPE = "CURRENT_AFFAIRS";

const CurrentAffairsModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  types,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [caTypes, setCaTypes] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    heading: "",
    description: "",
    fullContent: "",
    date: new Date().toISOString().split("T")[0],
    month: "",
    currentAffairsCategoryId: "",
    categoryId: "",
    subCategoryId: "",
    languageIds: [], // Changed to array for multiple selection
    isActive: true,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Init
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      setCaTypes(
        types.map((t) => ({
          label: t.categoryType,
          value: t._id,
          type: t.categoryType,
        })),
      ); // Map types from props

      if (initialData) {
        // Extract language IDs from languages array
        const langIds =
          initialData.languages?.map((lang) =>
            typeof lang === "object" ? lang._id : lang,
          ) || [];

        setFormData({
          name: initialData.name || "",
          heading: initialData.heading || "",
          description: initialData.description || "",
          fullContent: initialData.fullContent || "",
          date: initialData.date ? initialData.date.split("T")[0] : "",
          month: initialData.month || "",
          currentAffairsCategoryId:
            initialData.category?._id || initialData.category || "",
          categoryId:
            initialData.categories?.[0]?._id ||
            initialData.categories?.[0] ||
            "",
          subCategoryId:
            initialData.subCategories?.[0]?._id ||
            initialData.subCategories?.[0] ||
            "",
          languageIds: langIds,
          isActive: initialData.isActive ?? true,
        });
        setPreview(initialData.thumbnailUrl);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData, types]);

  const resetForm = () => {
    setFormData({
      name: "",
      heading: "",
      description: "",
      fullContent: "",
      date: new Date().toISOString().split("T")[0],
      month: "",
      currentAffairsCategoryId: "",
      categoryId: "",
      subCategoryId: "",
      languageIds: [],
      isActive: true,
    });
    setFile(null);
    setPreview(null);
    setActiveTab("basic");
  };

  const loadDropdowns = async () => {
    try {
      const [catRes, langRes] = await Promise.all([
        categoryService.getAll(CURRENT_AFFAIRS_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(langRes.data.map((l) => ({ label: l.name, value: l._id })));
    } catch (e) {
      console.error(e);
    }
  };

  // SubCategory Logic
  useEffect(() => {
    const loadSub = async () => {
      if (!formData.categoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await subCategoryService.getAll(
          CURRENT_AFFAIRS_CONTENT_TYPE,
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDropdown = (key, val) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("affair", JSON.stringify(formData));
    if (file) data.append("thumbnail", file);
    onSubmit(data);
  };

  const isMonthly =
    caTypes
      .find((t) => t.value === formData.currentAffairsCategoryId)
      ?.label?.toLowerCase() === "monthly";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />{" "}
            {initialData ? "Edit Current Affair" : "New Current Affair"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50">
          {["basic", "content", "classification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="ca-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "basic" && (
              <div className="grid gap-5">
                <div className="grid grid-cols-2 gap-5">
                  <CustomDropdown
                    label="CA Type"
                    options={caTypes}
                    value={formData.currentAffairsCategoryId}
                    onChange={(v) =>
                      handleDropdown("currentAffairsCategoryId", v)
                    }
                    icon={Layers}
                    placeholder="Select Type (e.g. Sports)"
                    required
                  />
                  <MultiSelect
                    label="Languages"
                    options={languages}
                    value={formData.languageIds}
                    onChange={(v) => handleDropdown("languageIds", v)}
                    icon={Type}
                    placeholder="Select one or more languages"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Enter affair name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Enter heading"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(val) =>
                      setFormData((p) => ({ ...p, date: val }))
                    }
                    type="date"
                    required
                  />
                  {isMonthly && (
                    <DatePicker
                      label="Month"
                      value={formData.month}
                      onChange={(val) =>
                        setFormData((p) => ({ ...p, month: val }))
                      }
                      type="month"
                      required
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Full Content
                  </label>
                  <textarea
                    name="fullContent"
                    value={formData.fullContent}
                    onChange={handleChange}
                    rows="8"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                {/* Thumbnail */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Thumbnail"
                      className="h-24 mx-auto object-contain mb-2 rounded"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  )}
                  <p className="text-xs text-slate-500 mb-2">
                    {file ? file.name : "Upload Thumbnail Image"}
                  </p>
                  <input
                    type="file"
                    onChange={handleFile}
                    accept="image/*"
                    className="text-xs mx-auto"
                  />
                </div>
              </div>
            )}

            {activeTab === "classification" && (
              <div className="grid grid-cols-2 gap-6">
                <CustomDropdown
                  label="Target Exam Category"
                  options={categories}
                  value={formData.categoryId}
                  onChange={(v) => handleDropdown("categoryId", v)}
                  icon={BookOpen}
                  required
                />
                <CustomDropdown
                  label="Target SubCategory"
                  options={subCategories}
                  value={formData.subCategoryId}
                  onChange={(v) => handleDropdown("subCategoryId", v)}
                  icon={Layers}
                  disabled={!formData.categoryId}
                  required
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ca-form"
            className="px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentAffairsModal;
