import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  onFieldChange, // Callback when a field changes
}) => {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [dynamicFields, setDynamicFields] = useState(fields);

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
      setDynamicFields(fields);
    }
  }, [isOpen, initialData, fields]);

  // Update dependent fields when formData changes
  useEffect(() => {
    if (onFieldChange) {
      const updatedFields = onFieldChange(formData, fields);
      if (updatedFields) {
        setDynamicFields(updatedFields);
      }
    }
  }, [formData, fields, onFieldChange]);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Clear dependent fields when parent field changes
      const field = dynamicFields.find((f) => f.name === name);
      if (field && field.clearDependents) {
        field.clearDependents.forEach((dep) => {
          updated[dep] = "";
        });
      }

      return updated;
    });
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

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
      style={{
        background:
          "linear-gradient(135deg, rgba(30, 91, 198, 0.9) 0%, rgba(74, 222, 128, 0.7) 100%)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, var(--color-brand-blue-lighter) 100%)",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "var(--color-brand-blue)",
        }}
      >
        {/* Decorative Elements - Brain Buzz Theme */}
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background:
              "linear-gradient(90deg, var(--color-brand-blue) 0%, var(--color-brand-green) 100%)",
          }}
        ></div>
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--color-brand-blue)", opacity: 0.2 }}
        ></div>
        <div
          className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--color-brand-green)", opacity: 0.2 }}
        ></div>

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-8 py-6 border-b-2"
          style={{
            borderColor: "var(--color-brand-blue-light)",
            background:
              "linear-gradient(90deg, #ffffff 0%, var(--color-brand-blue-lighter) 100%)",
          }}
        >
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 rounded-2xl text-white shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-green) 100%)",
                boxShadow:
                  "0 20px 25px -5px rgba(30, 91, 198, 0.3), 0 10px 10px -5px rgba(30, 91, 198, 0.2)",
              }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-brand-blue) 0%, var(--color-brand-green) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
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
              {dynamicFields.map((field, idx) => {
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
                        <Icon
                          className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors"
                          style={{ color: "var(--color-text-muted)" }}
                        />
                        <input
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 outline-none transition-all font-semibold shadow-lg hover:shadow-xl"
                          style={{
                            borderColor: "var(--color-input-border)",
                            backgroundColor: "var(--color-input-bg)",
                            color: "var(--color-input-text)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor =
                              "var(--color-brand-blue)";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(30, 91, 198, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor =
                              "var(--color-input-border)";
                            e.target.style.boxShadow = "";
                          }}
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
            className="relative px-10 py-3.5 text-sm font-extrabold text-white rounded-xl shadow-2xl flex items-center gap-3 transition-all overflow-hidden group"
            style={{
              background:
                "linear-gradient(90deg, var(--color-brand-blue) 0%, var(--color-brand-green) 100%)",
              boxShadow:
                "0 20px 25px -5px rgba(30, 91, 198, 0.3), 0 10px 10px -5px rgba(30, 91, 198, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05) translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1) translateY(0)";
            }}
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
    </motion.div>,
    document.body,
  );
};

export default GenericModal;
