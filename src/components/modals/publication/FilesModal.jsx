import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, FileText, Image as ImageIcon, Upload } from "lucide-react";
import toast from "react-hot-toast";
import publicationService from "../../../api/publicationService";

const FilesModal = ({ isOpen, onClose, onSuccess, publicationData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (isOpen && publicationData) {
      setThumbnailPreview(publicationData.thumbnailUrl || null);
      setThumbnailFile(null);
      setBookFile(null);
    }
  }, [isOpen, publicationData]);

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleBookFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBookFile(file);
    }
  };

  const handleUpdateThumbnail = async () => {
    if (!thumbnailFile) {
      return toast.error("Please select a thumbnail image first");
    }

    if (!publicationData?._id) {
      return toast.error("Publication ID is required");
    }

    const loadingToast = toast.loading("Updating thumbnail...");
    setIsSubmitting(true);

    try {
      const response = await publicationService.updateThumbnail(
        publicationData._id,
        thumbnailFile,
      );
      toast.success("Thumbnail updated successfully!", { id: loadingToast });
      setThumbnailPreview(response.data.thumbnailUrl);
      setThumbnailFile(null);
      // Reset file input
      document.getElementById("thumbnail-file-input").value = "";
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update thumbnail",
        {
          id: loadingToast,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBookFile = async () => {
    if (!bookFile) {
      return toast.error("Please select a book file first");
    }

    if (!publicationData?._id) {
      return toast.error("Publication ID is required");
    }

    const loadingToast = toast.loading("Updating book file...");
    setIsSubmitting(true);

    try {
      const response = await publicationService.updateBook(
        publicationData._id,
        bookFile,
      );
      toast.success("Book file updated successfully!", { id: loadingToast });
      setBookFile(null);
      // Reset file input
      document.getElementById("book-file-input").value = "";
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update book file",
        {
          id: loadingToast,
        },
      );
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" />
            <h2 className="text-xl font-bold">Files Management</h2>
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
            {/* Thumbnail Section */}
            <div className="p-5 border-2 rounded-xl bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                <ImageIcon size={18} />
                Thumbnail Image
              </h3>

              <div className="flex gap-4 items-start">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      className="w-32 h-32 object-cover bg-white rounded-lg border-2 border-slate-300"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 border-2 border-slate-300">
                      <ImageIcon size={40} />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">
                      Select Thumbnail
                    </label>
                    <input
                      id="thumbnail-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-orange-50 file:text-orange-700 file:border-0 hover:file:bg-orange-100 file:font-bold"
                    />
                  </div>
                  <button
                    onClick={handleUpdateThumbnail}
                    disabled={!thumbnailFile || isSubmitting}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Update Thumbnail
                  </button>
                  <p className="text-xs text-slate-500">
                    Recommended size: 400x400px or higher. Accepts JPG, PNG,
                    WebP
                  </p>
                </div>
              </div>
            </div>

            {/* Book File Section */}
            <div className="p-5 border-2 rounded-xl bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                <FileText size={18} />
                Book PDF/Document
              </h3>

              <div className="flex gap-4 items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border-2 border-green-300">
                    <FileText size={40} />
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">
                      Select Book File
                    </label>
                    <input
                      id="book-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleBookFileSelect}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-green-50 file:text-green-700 file:border-0 hover:file:bg-green-100 file:font-bold"
                    />
                  </div>
                  {bookFile && (
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-green-700">
                        <strong>Selected:</strong> {bookFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Size: {(bookFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleUpdateBookFile}
                    disabled={!bookFile || isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Update Book File
                  </button>
                  <p className="text-xs text-slate-500">
                    Accepts PDF, DOC, DOCX formats. Maximum file size: 100MB
                  </p>
                </div>
              </div>

              {/* Current File Info */}
              {publicationData?.bookFileUrl && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1">
                    Current Book File
                  </p>
                  <a
                    href={publicationData.bookFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Current File
                  </a>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="text-sm font-bold text-yellow-800 mb-2">
                📋 File Upload Guidelines
              </h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>
                  • <strong>Thumbnail:</strong> Should be a clear, high-quality
                  image representing the publication
                </li>
                <li>
                  • <strong>Book File:</strong> The actual content that users
                  will download
                </li>
                <li>
                  • Files are uploaded separately for better control and testing
                </li>
                <li>• Each update overwrites the previous file</li>
              </ul>
            </div>
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

export default FilesModal;
