import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  BookOpen,
  DollarSign,
  Layers,
  User,
  Image as ImageIcon,
  Upload,
  ChevronRight,
} from "lucide-react";
import {
  BasicInfoModal,
  PricingModal,
  ClassificationModal,
  AuthorsModal,
  GalleryModal,
  FilesModal,
} from "./publication";

const PublicationModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [publicationData, setPublicationData] = useState(initialData);

  React.useEffect(() => {
    if (isOpen) {
      setPublicationData(initialData);
      setActiveModal(null);
    }
  }, [isOpen, initialData]);

  const handleModalSuccess = (updatedData) => {
    setPublicationData(updatedData);
    if (onSubmit) onSubmit(updatedData);
  };

  const handleCreateNew = () => {
    setActiveModal("basic");
  };

  const sections = [
    {
      id: "basic",
      title: "Basic Info",
      description: "Edit publication name, date, format, and descriptions",
      icon: BookOpen,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      hoverColor: "hover:border-blue-400",
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Update original price, discount price, and pricing notes",
      icon: DollarSign,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      hoverColor: "hover:border-green-400",
    },
    {
      id: "classification",
      title: "Classification",
      description: "Manage categories, subcategories, languages, and validity",
      icon: Layers,
      color: "indigo",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      hoverColor: "hover:border-indigo-400",
    },
    {
      id: "authors",
      title: "Authors",
      description: "Add, edit, or remove publication authors",
      icon: User,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      hoverColor: "hover:border-purple-400",
    },
    {
      id: "gallery",
      title: "Gallery",
      description: "Manage publication gallery images",
      icon: ImageIcon,
      color: "pink",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      hoverColor: "hover:border-pink-400",
    },
    {
      id: "files",
      title: "Files",
      description: "Upload thumbnail image and book PDF/document",
      icon: Upload,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      hoverColor: "hover:border-orange-400",
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    {publicationData
                      ? `Edit Publication: ${publicationData.name}`
                      : "Create New Publication"}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Select a section below to manage
                  </p>
                </div>
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
              {!publicationData ? (
                /* Create New Publication */
                <div className="text-center py-12">
                  <BookOpen
                    size={64}
                    className="mx-auto mb-4 text-slate-300"
                  />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Create New Publication
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Start by creating the basic information for your publication
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <BookOpen size={18} />
                    Create Basic Info
                  </button>
                </div>
              ) : (
                /* Edit Existing Publication - Show All Sections */
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-700 mb-1">
                      Manage Publication Sections
                    </h3>
                    <p className="text-sm text-slate-500">
                      Click on any section below to open its dedicated editor
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveModal(section.id)}
                          className={`p-5 border-2 rounded-xl text-left transition-all ${section.bgColor} ${section.borderColor} ${section.hoverColor} hover:shadow-md group`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-3 rounded-lg ${section.bgColor} border ${section.borderColor}`}
                            >
                              <Icon className={`w-6 h-6 ${section.textColor}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`font-bold text-sm ${section.textColor}`}
                                >
                                  {section.title}
                                </h4>
                                <ChevronRight
                                  className={`w-5 h-5 ${section.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}
                                />
                              </div>
                              <p className="text-xs text-slate-600">
                                {section.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Publication Info Summary */}
                  <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">
                      📊 Publication Summary
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Name:</span>
                        <p className="font-bold text-slate-700">
                          {publicationData.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Format:</span>
                        <p className="font-bold text-slate-700">
                          {publicationData.availableIn || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <p
                          className={`font-bold ${publicationData.isActive ? "text-green-600" : "text-red-600"}`}
                        >
                          {publicationData.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Authors:</span>
                        <p className="font-bold text-slate-700">
                          {publicationData.authors?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Gallery Images:</span>
                        <p className="font-bold text-slate-700">
                          {publicationData.galleryImages?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Price:</span>
                        <p className="font-bold text-slate-700">
                          ₹{publicationData.originalPrice || 0}
                          {publicationData.discountPrice &&
                            ` → ₹${publicationData.discountPrice}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sub Modals */}
      <BasicInfoModal
        isOpen={activeModal === "basic"}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
        publicationData={activeModal === "basic" ? publicationData : null}
      />
      <PricingModal
        isOpen={activeModal === "pricing"}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
        publicationData={publicationData}
      />
      <ClassificationModal
        isOpen={activeModal === "classification"}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
        publicationData={publicationData}
      />
      <AuthorsModal
        isOpen={activeModal === "authors"}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
        publicationData={publicationData}
      />
      <GalleryModal
        isOpen={activeModal === "gallery"}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
        publicationData={publicationData}
      />
      <FilesModal
        isOpen={activeModal === "files"}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
        publicationData={publicationData}
      />
    </>
  );
};

export default PublicationModal;
