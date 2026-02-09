import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Loader2,
  Layers,
  BookOpen,
  Book,
  PenTool,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomDropdown from "../../common/CustomDropdown";
import { pyqService } from "../../../api/pyqService";
import categoryService from "../../../api/categoryService";
import subCategoryService from "../../../api/subCategoryService";
import examService from "../../../api/examService";
import subjectService from "../../../api/subjectService";

const PYQ_CONTENT_TYPE = "PYQ_EBOOK";

const ClassificationModal = ({ isOpen, onClose, onSuccess, pyqData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryId: "",
    examId: "",
    subjectId: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (pyqData) {
        setFormData({
          categoryId: pyqData.categoryId?._id || pyqData.categoryId || "",
          subCategoryId:
            pyqData.subCategoryId?._id || pyqData.subCategoryId || "",
          examId: pyqData.examId?._id || pyqData.examId || "",
          subjectId: pyqData.subjectId?._id || pyqData.subjectId || "",
        });
      }
    }
  }, [isOpen, pyqData]);

  const loadDropdowns = async () => {
    try {
      const [catRes, examRes, subjectRes] = await Promise.all([
        categoryService.getAll(PYQ_CONTENT_TYPE, true),
        examService.getAll(),
        subjectService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setExams(examRes.data.map((e) => ({ label: e.name, value: e._id })));
      setSubjects(
        subjectRes.data.map((s) => ({ label: s.name, value: s._id })),
      );
    } catch (e) {
      console.error(e);
      toast.error("Error loading dropdowns");
    }
  };

  // Dependent SubCategory Fetch
  useEffect(() => {
    const loadSub = async () => {
      if (!formData.categoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await subCategoryService.getAll(
          PYQ_CONTENT_TYPE,
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

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => {
      const updates = { ...prev, [field]: value };
      if (field === "categoryId") updates.subCategoryId = "";
      return updates;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pyqData?._id) {
      toast.error("PYQ ID is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating classification...");

    try {
      const response = await pyqService.updateClassification(
        pyqData._id,
        formData,
      );
      toast.success("Classification updated successfully!", {
        id: loadingToast,
      });
      if (onSuccess) onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Update failed", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6" />
            <h2 className="text-xl font-bold">Update Classification</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category & SubCategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomDropdown
                label="Category"
                value={formData.categoryId}
                onChange={(val) => handleDropdownChange("categoryId", val)}
                options={categories}
                placeholder="Select Category"
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
                    : "Select Sub Category"
                }
                icon={Layers}
                searchable
                disabled={!formData.categoryId}
                required
              />
            </div>

            {/* Exam & Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomDropdown
                label="Select Exam"
                value={formData.examId}
                onChange={(val) => handleDropdownChange("examId", val)}
                options={exams}
                placeholder="Choose Exam"
                icon={Book}
                searchable
              />

              <CustomDropdown
                label="Select Subject"
                value={formData.subjectId}
                onChange={(val) => handleDropdownChange("subjectId", val)}
                options={subjects}
                placeholder="Choose Subject"
                icon={PenTool}
                searchable
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="text-sm font-bold text-indigo-800 mb-2">
                Classification Summary
              </h4>
              <div className="space-y-1 text-sm text-slate-600">
                <div>
                  <strong>Category:</strong>{" "}
                  {categories.find((c) => c.value === formData.categoryId)
                    ?.label || "Not selected"}
                </div>
                <div>
                  <strong>SubCategory:</strong>{" "}
                  {subCategories.find((s) => s.value === formData.subCategoryId)
                    ?.label || "Not selected"}
                </div>
                <div>
                  <strong>Exam:</strong>{" "}
                  {exams.find((e) => e.value === formData.examId)?.label ||
                    "Not selected"}
                </div>
                <div>
                  <strong>Subject:</strong>{" "}
                  {subjects.find((s) => s.value === formData.subjectId)
                    ?.label || "Not selected"}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Classification
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ClassificationModal;
