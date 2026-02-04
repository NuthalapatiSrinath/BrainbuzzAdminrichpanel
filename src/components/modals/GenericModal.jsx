import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  Type,
  Layers,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "../common/CustomDropdown";

const GenericModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  fields,
}) => {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      const initialPreviews = {};

      fields.forEach((field) => {
        const val = initialData
          ? initialData[field.name]?._id || initialData[field.name]
          : "";
        initial[field.name] = val || "";

        if (
          field.type === "file" &&
          initialData &&
          initialData[field.previewKey || "thumbnailUrl"]
        ) {
          initialPreviews[field.name] =
            initialData[field.previewKey || "thumbnailUrl"];
        }
      });

      setFormData(initial);
      setPreviews(initialPreviews);
      setFiles({});
    }
  }, [isOpen, initialData, fields]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFiles((prev) => ({ ...prev, [name]: file }));

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: objectUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, ...files });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/80 via-indigo-900/70 to-purple-900/80 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 rounded-3xl shadow-2xl border-2 border-indigo-200/50 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-8 py-6 border-b-2 border-indigo-100 dark:border-slate-700 bg-gradient-to-r from-white via-indigo-50/60 to-purple-50/60 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-2xl shadow-indigo-500/50"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.15, rotate: 180 }}
            whileTap={{ scale: 0.85 }}
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-600 rounded-xl transition-all shadow-lg hover:shadow-red-500/50"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Body */}
        {/* ✅ FIX: Added min-h-[400px] here so the dropdown has space to open without scrolling */}
        <div className="relative flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-800 min-h-[400px]">
          <form id="generic-form" onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field, idx) => {
                const Icon = field.icon || Type;
                const isFullWidth =
                  field.fullWidth ||
                  field.type === "textarea" ||
                  field.type === "file";

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={isFullWidth ? "md:col-span-2" : "col-span-1"}
                  >
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2.5 ml-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                      {field.label}
                    </label>

                    {/* INPUTS */}
                    {(field.type === "text" ||
                      field.type === "date" ||
                      field.type === "number") && (
                      <div className="relative group">
                        <Icon className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl placeholder:text-slate-400"
                          placeholder={field.placeholder}
                          required={field.required}
                          disabled={field.disabled}
                        />
                      </div>
                    )}

                    {/* DROPDOWN */}
                    {field.type === "select" && (
                      <CustomDropdown
                        value={formData[field.name]}
                        onChange={(val) => handleChange(field.name, val)}
                        options={field.options || []}
                        placeholder={field.placeholder}
                        icon={field.icon}
                        searchable
                        required={field.required}
                        disabled={field.disabled}
                      />
                    )}

                    {/* TEXTAREA */}
                    {field.type === "textarea" && (
                      <textarea
                        rows={5}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="w-full px-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 outline-none transition-all resize-none text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl font-medium placeholder:text-slate-400"
                        placeholder={field.placeholder}
                      />
                    )}

                    {/* FILE WITH FULL IMAGE PREVIEW */}
                    {field.type === "file" && (
                      <div
                        className={`relative group border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 ${
                          previews[field.name]
                            ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10"
                            : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/30 dark:hover:from-indigo-900/10 dark:hover:to-purple-900/5"
                        }`}
                      >
                        {previews[field.name] ? (
                          <div className="mb-4 relative w-full h-52 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-lg">
                            <img
                              src={previews[field.name]}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <p className="text-white text-xs font-bold">
                                Click to Change
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                              <Upload className="w-6 h-6" />
                            </div>
                          </div>
                        )}

                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {files[field.name]?.name ||
                            (previews[field.name]
                              ? "Change Image"
                              : "Upload " + field.label)}
                        </p>
                        <input
                          type="file"
                          accept={field.accept}
                          onChange={(e) =>
                            handleFileChange(field.name, e.target.files[0])
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required={field.required && !previews[field.name]}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="relative px-8 py-6 border-t-2 border-indigo-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-purple-50/40 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 text-sm font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            form="generic-form"
            className="relative px-10 py-3.5 text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl shadow-indigo-500/50 flex items-center gap-3 transition-all overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <CheckCircle className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Save Changes</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GenericModal;
