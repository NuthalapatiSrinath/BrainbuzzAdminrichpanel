import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Save,
  FileText,
  Calendar,
  Type,
  Hash,
  BookOpen,
  Layers,
  Book, // For Exam Icon
  PenTool, // For Subject Icon
  Image as ImageIcon,
} from "lucide-react";
import CustomDropdown from "../common/CustomDropdown";
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import examService from "../../api/examService"; // ✅ Import Exam Service
import subjectService from "../../api/subjectService"; // ✅ Import Subject Service

const PYQ_CONTENT_TYPE = "PYQ_EBOOK";

const PYQModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryId: "",
    paperCategory: "",
    examId: "",
    subjectId: "",
    date: new Date().toISOString().split("T")[0],
    examDate: "",
    description: "",
  });

  const [files, setFiles] = useState({
    thumbnail: null,
    paper: null,
  });

  const [previews, setPreviews] = useState({ thumbnail: null });

  // Dropdown Options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [exams, setExams] = useState([]); // ✅ State for Exams
  const [subjects, setSubjects] = useState([]); // ✅ State for Subjects

  const [loading, setLoading] = useState({
    categories: false,
    subCategories: false,
    exams: false,
    subjects: false,
  });

  // --- INITIALIZE FORM ---
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          categoryId:
            initialData.categoryId?._id || initialData.categoryId || "",
          subCategoryId:
            initialData.subCategoryId?._id || initialData.subCategoryId || "",
          paperCategory: initialData.paperCategory || "",
          examId: initialData.examId?._id || initialData.examId || "", // Handle populated object
          subjectId: initialData.subjectId?._id || initialData.subjectId || "", // Handle populated object
          date: initialData.date ? initialData.date.split("T")[0] : "",
          examDate: initialData.examDate
            ? initialData.examDate.split("T")[0]
            : "",
          description: initialData.description || "",
        });
        setPreviews({ thumbnail: initialData.thumbnailUrl || null });
      } else {
        setFormData({
          categoryId: "",
          subCategoryId: "",
          paperCategory: "",
          examId: "",
          subjectId: "",
          date: new Date().toISOString().split("T")[0],
          examDate: "",
          description: "",
        });
        setPreviews({ thumbnail: null });
        setFiles({ thumbnail: null, paper: null });
      }
    }
  }, [initialData, isOpen]);

  // --- FETCH DATA FOR DROPDOWNS ---
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadExams();
      loadSubjects();
    }
  }, [isOpen]);

  // Load Categories
  const loadCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const response = await categoryService.getAll(PYQ_CONTENT_TYPE, true);
      setCategories(
        (response.data || []).map((cat) => ({
          label: cat.name,
          value: cat._id,
        })),
      );
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Load Exams
  const loadExams = async () => {
    setLoading((prev) => ({ ...prev, exams: true }));
    try {
      const response = await examService.getAll();
      setExams(
        (response.data || []).map((ex) => ({ label: ex.name, value: ex._id })),
      );
    } catch (error) {
      console.error("Failed to load exams", error);
    } finally {
      setLoading((prev) => ({ ...prev, exams: false }));
    }
  };

  // Load Subjects
  const loadSubjects = async () => {
    setLoading((prev) => ({ ...prev, subjects: true }));
    try {
      const response = await subjectService.getAll();
      setSubjects(
        (response.data || []).map((sub) => ({
          label: sub.name,
          value: sub._id,
        })),
      );
    } catch (error) {
      console.error("Failed to load subjects", error);
    } finally {
      setLoading((prev) => ({ ...prev, subjects: false }));
    }
  };

  // Load SubCategories (Dependent on Category)
  useEffect(() => {
    const loadSubCategories = async () => {
      if (!formData.categoryId) {
        setSubCategories([]);
        return;
      }
      setLoading((prev) => ({ ...prev, subCategories: true }));
      try {
        const response = await subCategoryService.getAll(
          PYQ_CONTENT_TYPE,
          formData.categoryId,
        );
        setSubCategories(
          (response.data || []).map((sub) => ({
            label: sub.name,
            value: sub._id,
          })),
        );
      } catch (error) {
        console.error("Failed to load subcategories", error);
      } finally {
        setLoading((prev) => ({ ...prev, subCategories: false }));
      }
    };
    loadSubCategories();
  }, [formData.categoryId]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => {
      const updates = { [field]: value };
      if (field === "categoryId") updates.subCategoryId = "";
      return { ...prev, ...updates };
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles?.[0]) {
      const file = selectedFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));
      if (name === "thumbnail") {
        setPreviews((prev) => ({
          ...prev,
          thumbnail: URL.createObjectURL(file),
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      thumbnailFile: files.thumbnail,
      paperFile: files.paper,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            {initialData ? "Edit Question Paper" : "Add Question Paper"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="pyq-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Classification */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-indigo-500" /> Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomDropdown
                  label="Category"
                  value={formData.categoryId}
                  onChange={(val) => handleDropdownChange("categoryId", val)}
                  options={categories}
                  placeholder={
                    loading.categories ? "Loading..." : "Select Category"
                  }
                  icon={BookOpen}
                  searchable
                  required
                />
                <CustomDropdown
                  label="Sub Category"
                  value={formData.subCategoryId}
                  onChange={(val) => handleDropdownChange("subCategoryId", val)}
                  options={subCategories}
                  placeholder={
                    !formData.categoryId
                      ? "Select Category First"
                      : loading.subCategories
                        ? "Loading..."
                        : "Select Sub Category"
                  }
                  icon={Layers}
                  searchable
                  disabled={!formData.categoryId}
                  required
                />
              </div>
            </div>

            {/* Exam Details (Using Dropdowns now) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-500" /> Exam Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ✅ Exam Dropdown */}
                <CustomDropdown
                  label="Select Exam"
                  value={formData.examId}
                  onChange={(val) => handleDropdownChange("examId", val)}
                  options={exams}
                  placeholder={loading.exams ? "Loading..." : "Choose Exam"}
                  icon={Book}
                  searchable
                />

                {/* ✅ Subject Dropdown */}
                <CustomDropdown
                  label="Select Subject"
                  value={formData.subjectId}
                  onChange={(val) => handleDropdownChange("subjectId", val)}
                  options={subjects}
                  placeholder={
                    loading.subjects ? "Loading..." : "Choose Subject"
                  }
                  icon={PenTool}
                  searchable
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Paper Type
                  </label>
                  <div className="relative">
                    <Type className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    {/* Assuming this is strictly 'EXAM' or 'LATEST' based on backend enum, but kept as text per previous UI, changed placeholder to hint */}
                    <input
                      type="text"
                      name="paperCategory"
                      value={formData.paperCategory}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="EXAM or LATEST"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Admin Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Exam Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      name="examDate"
                      value={formData.examDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none resize-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Enter detailed description..."
                />
              </div>
            </div>

            {/* Files Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" /> Attachments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Thumbnail */}
                <div
                  className={`relative group border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 ${previews.thumbnail ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30"}`}
                >
                  {previews.thumbnail ? (
                    <div className="mb-3 relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={previews.thumbnail}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <p className="text-white text-xs font-bold">
                          Click to Change
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors bg-indigo-50 text-indigo-500">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                  <p className="text-sm font-bold text-slate-700 mb-1">
                    {files.thumbnail
                      ? files.thumbnail.name
                      : previews.thumbnail
                        ? "Change Thumbnail"
                        : "Upload Thumbnail"}
                  </p>
                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* PDF */}
                <div
                  className={`relative group border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${files.paper ? "border-green-400 bg-green-50/50" : "border-slate-200 hover:border-indigo-400"}`}
                >
                  <div className="mb-3">
                    <div
                      className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors ${files.paper ? "bg-green-100 text-green-600" : "bg-indigo-50 text-indigo-500"}`}
                    >
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">
                    {files.paper ? files.paper.name : "Question Paper (PDF)"}
                  </p>
                  {initialData?.fileUrl && !files.paper && (
                    <p className="text-xs text-blue-600 underline mt-1 mb-2">
                      <a
                        href={initialData.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Current PDF
                      </a>
                    </p>
                  )}
                  <p className="text-xs text-slate-400">
                    {files.paper
                      ? "Click to change"
                      : initialData
                        ? "Upload to replace current PDF"
                        : "Required for new paper"}
                  </p>
                  <input
                    type="file"
                    name="paper"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={!initialData}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="pyq-form"
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />{" "}
            {initialData ? "Update Paper" : "Save Paper"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PYQModal;
