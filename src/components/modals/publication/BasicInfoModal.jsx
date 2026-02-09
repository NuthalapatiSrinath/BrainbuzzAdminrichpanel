import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import DatePicker from "../../common/DatePicker";
import publicationService from "../../../api/publicationService";

const BasicInfoModal = ({ isOpen, onClose, onSuccess, publicationData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    availableIn: "HARD_COPY",
    isActive: true,
    shortDescription: "",
    detailedDescription: "",
  });

  useEffect(() => {
    if (isOpen && publicationData) {
      const formattedDate = publicationData.startDate
        ? new Date(publicationData.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        name: publicationData.name || "",
        startDate: formattedDate,
        availableIn: publicationData.availableIn || "HARD_COPY",
        isActive: publicationData.isActive ?? true,
        shortDescription: publicationData.shortDescription || "",
        detailedDescription: publicationData.detailedDescription || "",
      });
    }
  }, [isOpen, publicationData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      publicationData ? "Updating basic info..." : "Creating publication...",
    );

    try {
      let response;
      if (publicationData) {
        // Update existing publication basic info
        response = await publicationService.updateBasicInfo(
          publicationData._id,
          formData,
        );
        toast.success("Basic info updated successfully!", { id: loadingToast });
      } else {
        // Create new publication
        response = await publicationService.create(formData);
        toast.success("Publication created successfully!", {
          id: loadingToast,
        });
      }

      if (onSuccess) onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Operation failed", {
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-xl font-bold">
              {publicationData ? "Edit Basic Info" : "Create Publication"}
            </h2>
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
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <DatePicker
                    label="Start Date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleDateChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Format
                  </label>
                  <select
                    name="availableIn"
                    value={formData.availableIn}
                    onChange={handleChange}
                    className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="HARD_COPY">Hard Copy</option>
                    <option value="E_BOOK">E-Book</option>
                    <option value="PUBLICATION">Publication</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Detailed Description
                </label>
                <textarea
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 accent-green-600"
                />
                <label className="text-sm font-bold text-slate-700">
                  Publish Immediately
                </label>
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
            className="px-6 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {publicationData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default BasicInfoModal;
