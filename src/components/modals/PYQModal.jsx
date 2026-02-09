import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Calendar,
  Layers,
  Upload,
  ChevronRight,
} from "lucide-react";
import { BasicInfoModal, ClassificationModal, FilesModal } from "./pyq";

const PYQModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [activeModal, setActiveModal] = useState(null);

  const sections = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Paper type, dates, and description",
      icon: Calendar,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "classification",
      title: "Classification",
      description: "Category, subcategory, exam, and subject",
      icon: Layers,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "files",
      title: "Files & Attachments",
      description: "Thumbnail and question paper PDF",
      icon: Upload,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  const handleSectionClick = (sectionId) => {
    setActiveModal(sectionId);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleModalSuccess = (updatedData) => {
    onSuccess(updatedData);
    setActiveModal(null);
  };

  // For create mode, return the old form-based modal
  if (!initialData) {
    return null; // Or implement a separate create modal
  }

  // For edit mode, show section cards
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            Edit Question Paper
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Section Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="group relative bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-left transition-all duration-300 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${section.color} transition-transform group-hover:scale-110`}
                  >
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-indigo-500" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {activeModal === "basic" && (
        <BasicInfoModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          pyqData={initialData}
        />
      )}
      {activeModal === "classification" && (
        <ClassificationModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          pyqData={initialData}
        />
      )}
      {activeModal === "files" && (
        <FilesModal
          isOpen={true}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          pyqData={initialData}
        />
      )}
    </div>,
    document.body,
  );
};

export default PYQModal;
