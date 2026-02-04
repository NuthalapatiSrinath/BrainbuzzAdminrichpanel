import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ModalManager = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // sm, md, lg, xl, full
  pageName, // Optional: for debugging or specific styling
  modalType, // Optional: EDIT or CREATE
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Size configurations
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative w-full ${currentSize} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                {(pageName || modalType) && (
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                    {pageName} {modalType && `• ${modalType}`}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-0">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalManager;
