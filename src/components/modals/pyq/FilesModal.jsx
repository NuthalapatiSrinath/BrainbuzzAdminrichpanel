import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Upload, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { pyqService } from "../../../api/pyqService";

const FilesModal = ({ isOpen, onClose, onSuccess, pyqData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [paperFile, setPaperFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (isOpen && pyqData) {
      setThumbnailPreview(pyqData.thumbnailUrl || null);
      setThumbnailFile(null);
      setPaperFile(null);
    }
  }, [isOpen, pyqData]);

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handlePaperSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaperFile(file);
    }
  };

  const handleUpdateThumbnail = async () => {
    if (!thumbnailFile) {
      return toast.error("Please select a thumbnail image first");
    }

    if (!pyqData?._id) {
      return toast.error("PYQ ID is required");
    }

    const loadingToast = toast.loading("Updating thumbnail...");
    setIsSubmitting(true);

    try {
      const response = await pyqService.updateThumbnail(
        pyqData._id,
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

  const handleUpdatePaper = async () => {
    if (!paperFile) {
      return toast.error("Please select a question paper file first");
    }

    if (!pyqData?._id) {
      return toast.error("PYQ ID is required");
    }

    const loadingToast = toast.loading("Updating question paper...");
    setIsSubmitting(true);

    try {
      const response = await pyqService.updatePaper(pyqData._id, paperFile);
      toast.success("Question paper updated successfully!", {
        id: loadingToast,
      });
      setPaperFile(null);
      // Reset file input
      document.getElementById("paper-file-input").value = "";
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update question paper",
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-2xl">
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
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-indigo-50 file:text-indigo-700 file:border-0 hover:file:bg-indigo-100 file:font-bold"
                    />
                  </div>
                  <button
                    onClick={handleUpdateThumbnail}
                    disabled={!thumbnailFile || isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

            {/* Question Paper Section */}
            <div className="p-5 border-2 rounded-xl bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                <FileText size={18} />
                Question Paper PDF
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
                      Select Question Paper
                    </label>
                    <input
                      id="paper-file-input"
                      type="file"
                      accept=".pdf"
                      onChange={handlePaperSelect}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-green-50 file:text-green-700 file:border-0 hover:file:bg-green-100 file:font-bold"
                    />
                  </div>
                  {paperFile && (
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-green-700">
                        <strong>Selected:</strong> {paperFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Size: {(paperFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleUpdatePaper}
                    disabled={!paperFile || isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Update Question Paper
                  </button>
                  <p className="text-xs text-slate-500">
                    Accepts PDF format only. Maximum file size: 100MB
                  </p>
                </div>
              </div>

              {/* Current File Info */}
              {/* {pyqData?.fileUrl && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1">
                    Current Question Paper
                  </p>
                </div>
              )} */}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="text-sm font-bold text-yellow-800 mb-2">
                📋 File Upload Guidelines
              </h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>
                  • <strong>Thumbnail:</strong> Should be a clear, high-quality
                  image representing the question paper
                </li>
                <li>
                  • <strong>Question Paper:</strong> The actual PDF that users
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
