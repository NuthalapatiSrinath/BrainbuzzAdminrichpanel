import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, User, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import publicationService from "../../../api/publicationService";

const AuthorsModal = ({ isOpen, onClose, onSuccess, publicationData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    qualification: "",
    subject: "",
  });
  const [newAuthorImage, setNewAuthorImage] = useState(null);
  const [authorImages, setAuthorImages] = useState({});

  useEffect(() => {
    if (isOpen && publicationData) {
      // Deep clone authors array to ensure proper state management
      const clonedAuthors = publicationData.authors
        ? JSON.parse(JSON.stringify(publicationData.authors))
        : [];
      setAuthors(clonedAuthors);
      setNewAuthor({ name: "", qualification: "", subject: "" });
      setNewAuthorImage(null);
      setAuthorImages({});
    }
  }, [isOpen, publicationData]);

  const handleAddAuthor = async () => {
    if (!newAuthor.name || !newAuthor.subject) {
      return toast.error("Name & Subject are required");
    }

    if (!publicationData?._id) {
      return toast.error("Publication ID is required");
    }

    const loadingToast = toast.loading("Adding author...");
    setIsSubmitting(true);

    try {
      const response = await publicationService.addAuthor(
        publicationData._id,
        newAuthor,
        newAuthorImage,
      );
      toast.success("Author added successfully!", { id: loadingToast });
      setAuthors(response.data.authors || []);
      setNewAuthor({ name: "", qualification: "", subject: "" });
      setNewAuthorImage(null);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to add author", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAuthor = async (author, index) => {
    if (!author.name || !author.subject) {
      return toast.error("Name & Subject are required");
    }

    const loadingToast = toast.loading("Updating author...");
    setIsSubmitting(true);

    try {
      const imageFile = authorImages[author._id];
      const response = await publicationService.updateAuthor(
        publicationData._id,
        author._id,
        author,
        imageFile,
      );
      toast.success("Author updated successfully!", { id: loadingToast });
      setAuthors(response.data.authors || []);
      // Clear the image file from state after successful update
      setAuthorImages((prev) => {
        const updated = { ...prev };
        delete updated[author._id];
        return updated;
      });
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to update author", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAuthor = async (authorId) => {
    if (!window.confirm("Are you sure you want to delete this author?")) {
      return;
    }

    const loadingToast = toast.loading("Deleting author...");
    setIsSubmitting(true);

    try {
      const response = await publicationService.deleteAuthor(
        publicationData._id,
        authorId,
      );
      toast.success("Author deleted successfully!", { id: loadingToast });
      setAuthors(response.data.authors || []);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete author", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAuthorField = (index, field, value) => {
    setAuthors((prevAuthors) => {
      const updatedAuthors = [...prevAuthors];
      updatedAuthors[index] = {
        ...updatedAuthors[index],
        [field]: value,
      };
      return updatedAuthors;
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">Manage Authors</h2>
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
          <div className="space-y-4">
            {/* Existing Authors */}
            {authors.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase">
                  Existing Authors ({authors.length})
                </h3>
                {authors.map((author, index) => (
                  <div
                    key={author._id}
                    className="p-4 border rounded-xl bg-slate-50 relative"
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateAuthor(author, index)}
                        disabled={isSubmitting}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Update Author"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAuthor(author._id)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete Author"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Name *
                        </label>
                        <input
                          placeholder="Author Name"
                          value={author.name || ""}
                          onChange={(e) =>
                            updateAuthorField(index, "name", e.target.value)
                          }
                          className="w-full border p-2 rounded-lg text-sm outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Subject *
                        </label>
                        <input
                          placeholder="Subject"
                          value={author.subject || ""}
                          onChange={(e) =>
                            updateAuthorField(index, "subject", e.target.value)
                          }
                          className="w-full border p-2 rounded-lg text-sm outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Qualification
                        </label>
                        <input
                          placeholder="Qualification"
                          value={author.qualification || ""}
                          onChange={(e) =>
                            updateAuthorField(
                              index,
                              "qualification",
                              e.target.value,
                            )
                          }
                          className="w-full border p-2 rounded-lg text-sm outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Author Image */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <label className="text-xs font-bold text-slate-500">
                        Photo:
                      </label>
                      {author.photoUrl && (
                        <img
                          src={author.photoUrl}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setAuthorImages((prev) => ({
                            ...prev,
                            [author._id]: e.target.files[0],
                          }));
                        }}
                        className="text-xs flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <User size={48} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No authors added yet</p>
              </div>
            )}

            {/* Add New Author */}
            <div className="p-5 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/30">
              <h4 className="text-xs font-bold text-purple-600 uppercase mb-4 flex items-center gap-2">
                <Plus size={16} /> Add New Author
              </h4>
              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Name *
                  </label>
                  <input
                    placeholder="Author Name"
                    value={newAuthor.name}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, name: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Subject *
                  </label>
                  <input
                    placeholder="Subject"
                    value={newAuthor.subject}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, subject: e.target.value })
                    }
                    className="w-full border p-2 rounded text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Qualification
                  </label>
                  <input
                    placeholder="Qualification"
                    value={newAuthor.qualification}
                    onChange={(e) =>
                      setNewAuthor({
                        ...newAuthor,
                        qualification: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs w-full"
                    onChange={(e) => setNewAuthorImage(e.target.files[0])}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  disabled={isSubmitting}
                  className="mt-5 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Add Author
                </button>
              </div>
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

export default AuthorsModal;
