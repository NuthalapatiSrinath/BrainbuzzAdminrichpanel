import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import publicationService from "../../../api/publicationService";

const GalleryModal = ({ isOpen, onClose, onSuccess, publicationData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen && publicationData) {
      setGalleryImages(publicationData.galleryImages || []);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, publicationData]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddImage = async () => {
    if (!selectedFile) {
      return toast.error("Please select an image first");
    }

    if (!publicationData?._id) {
      return toast.error("Publication ID is required");
    }

    const loadingToast = toast.loading("Uploading image...");
    setIsSubmitting(true);

    try {
      const response = await publicationService.addGalleryImage(
        publicationData._id,
        selectedFile,
      );
      toast.success("Image added successfully!", { id: loadingToast });
      setGalleryImages(response.data.galleryImages || []);
      setSelectedFile(null);
      setPreviewUrl(null);
      // Reset file input
      document.getElementById("gallery-file-input").value = "";
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to add image", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = async (imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    const loadingToast = toast.loading("Removing image...");
    setIsSubmitting(true);

    try {
      const response = await publicationService.removeGalleryImage(
        publicationData._id,
        imageUrl,
      );
      toast.success("Image removed successfully!", { id: loadingToast });
      setGalleryImages(response.data.galleryImages || []);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to remove image", {
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Gallery Management</h2>
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
          <div className="space-y-6">
            {/* Upload New Image */}
            <div className="p-5 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50/30">
              <h4 className="text-xs font-bold text-pink-600 uppercase mb-4 flex items-center gap-2">
                <Upload size={16} /> Upload New Image
              </h4>
              <div className="space-y-4">
                <div>
                  <input
                    id="gallery-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-pink-50 file:text-pink-700 file:border-0 hover:file:bg-pink-100 file:font-bold"
                  />
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-pink-300"
                      />
                    </div>
                    <button
                      onClick={handleAddImage}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Upload size={16} />
                      )}
                      Upload Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Grid */}
            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase mb-4">
                Gallery Images ({galleryImages.length})
              </h3>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border-2 border-slate-200 hover:border-pink-400 transition-all"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          disabled={isSubmitting}
                          className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                          title="Delete Image"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white font-bold">
                          Image {idx + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <ImageIcon
                    size={64}
                    className="mx-auto mb-3 text-slate-300"
                  />
                  <p className="text-sm text-slate-500">
                    No images in gallery yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your first image above
                  </p>
                </div>
              )}
            </div>

            {/* Image Info */}
            {galleryImages.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-bold text-blue-800 mb-2">
                  Gallery Info
                </h4>
                <div className="text-sm text-slate-600">
                  <p>
                    <strong>Total Images:</strong> {galleryImages.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    These images will be displayed in the publication's gallery
                    section
                  </p>
                </div>
              </div>
            )}
          </div>
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
    document.body,
  );
};

export default GalleryModal;
