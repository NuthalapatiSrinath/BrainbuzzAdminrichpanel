import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Calendar, Type, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { pyqService } from "../../../api/pyqService";

const BasicInfoModal = ({ isOpen, onClose, onSuccess, pyqData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    paperCategory: "",
    date: "",
    examDate: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen && pyqData) {
      setFormData({
        paperCategory: pyqData.paperCategory || "",
        date: pyqData.date ? pyqData.date.split("T")[0] : "",
        examDate: pyqData.examDate ? pyqData.examDate.split("T")[0] : "",
        description: pyqData.description || "",
      });
    }
  }, [isOpen, pyqData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pyqData?._id) {
      toast.error("PYQ ID is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating basic info...");

    try {
      const response = await pyqService.updateBasicInfo(pyqData._id, formData);
      toast.success("Basic info updated successfully!", { id: loadingToast });
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Update Basic Information</h2>
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
            {/* Paper Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Paper Type *
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
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

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Admin Date *
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Exam Date *
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

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none resize-none text-slate-700 placeholder:text-slate-400"
                placeholder="Enter detailed description..."
              />
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
            Update Basic Info
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default BasicInfoModal;
