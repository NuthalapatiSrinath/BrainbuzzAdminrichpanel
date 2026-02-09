import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Layers } from "lucide-react";
import toast from "react-hot-toast";
import MultiSelect from "../../common/MultiSelect";
import publicationService from "../../../api/publicationService";
import categoryService from "../../../api/categoryService";
import subCategoryService from "../../../api/subCategoryService";
import validityService from "../../../api/validityService";

const PUBLICATION_CONTENT_TYPE = "PUBLICATION";

const ClassificationModal = ({
  isOpen,
  onClose,
  onSuccess,
  publicationData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [validities, setValidities] = useState([]);

  const [formData, setFormData] = useState({
    categoryIds: [],
    subCategoryIds: [],
    validityIds: [],
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (publicationData) {
        setFormData({
          categoryIds: publicationData.categories?.map((c) => c._id || c) || [],
          subCategoryIds:
            publicationData.subCategories?.map((s) => s._id || s) || [],
          validityIds: publicationData.validities?.map((v) => v._id || v) || [],
        });
      }
    }
  }, [isOpen, publicationData]);

  const loadDropdowns = async () => {
    try {
      const [catRes, valRes] = await Promise.all([
        categoryService.getAll(PUBLICATION_CONTENT_TYPE, true),
        validityService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setValidities(valRes.data.map((v) => ({ label: v.label, value: v._id })));
    } catch (e) {
      console.error(e);
      toast.error("Error loading dropdowns");
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
        const firstCatId = Array.isArray(formData.categoryIds)
          ? formData.categoryIds[0]
          : formData.categoryIds;
        const res = await subCategoryService.getAll(
          PUBLICATION_CONTENT_TYPE,
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

  const handleToggle = (field, id) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const newVals = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, [field]: newVals };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!publicationData?._id) {
      toast.error("Publication ID is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating classification...");

    try {
      const response = await publicationService.updateClassification(
        publicationData._id,
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
            {/* Categories */}
            <div>
              <MultiSelect
                label="Categories *"
                options={categories}
                value={formData.categoryIds}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryIds: val,
                    subCategoryIds: [],
                  }))
                }
                placeholder="Select Categories"
                icon={Layers}
                required
              />
            </div>

            {/* SubCategories */}
            <div>
              <MultiSelect
                label="SubCategories"
                options={subCategories}
                value={formData.subCategoryIds}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, subCategoryIds: val }))
                }
                placeholder="Select SubCategories"
                icon={Layers}
                disabled={!formData.categoryIds?.length}
              />
            </div>

            {/* Validities */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Validity Periods
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {validities.map((validity) => (
                  <button
                    key={validity.value}
                    type="button"
                    onClick={() => handleToggle("validityIds", validity.value)}
                    className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition ${
                      formData.validityIds.includes(validity.value)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {validity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="text-sm font-bold text-indigo-800 mb-2">
                Classification Summary
              </h4>
              <div className="space-y-1 text-sm text-slate-600">
                <div>
                  <strong>Categories:</strong>{" "}
                  {formData.categoryIds.length || 0} selected
                </div>
                <div>
                  <strong>SubCategories:</strong>{" "}
                  {formData.subCategoryIds.length || 0} selected
                </div>
                <div>
                  <strong>Validities:</strong>{" "}
                  {formData.validityIds.length || 0} selected
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
