import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  User,
  DollarSign,
  BookOpen,
  Layers,
  FileText,
  Image as ImageIcon,
  Trash2,
  Check,
  RefreshCw,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomDropdown from "../common/CustomDropdown";

// Services
import publicationService from "../../api/publicationService"; // ✅ Import for direct updates
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";
import validityService from "../../api/validityService";

const PUBLICATION_CONTENT_TYPE = "PUBLICATION";

const PublicationModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown Data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [validities, setValidities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({});
  const [authors, setAuthors] = useState([]);

  // File States
  const [files, setFiles] = useState({
    thumbnail: null,
    bookFile: null,
    authorImages: {}, // Map index -> file
  });

  const [previews, setPreviews] = useState({ thumbnail: null });

  // New Author State (For Edit Mode Adding)
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    qualification: "",
    subject: "",
  });
  const [newAuthorImage, setNewAuthorImage] = useState(null);

  // --- Init ---
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        populateForm(initialData);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const populateForm = (data) => {
    setFormData({
      name: data.name || "",
      startDate: data.startDate ? data.startDate.split("T")[0] : "",
      availableIn: data.availableIn || "HARD_COPY",
      isActive: data.isActive ?? true,
      originalPrice: data.originalPrice || "",
      discountPrice: data.discountPrice || "",
      pricingNote: data.pricingNote || "",
      shortDescription: data.shortDescription || "",
      detailedDescription: data.detailedDescription || "",
      categoryIds: data.categories?.map((c) => c._id || c) || [],
      subCategoryIds: data.subCategories?.map((c) => c._id || c) || [],
      languageIds: data.languages?.map((l) => l._id || l) || [],
      validityIds: data.validities?.map((v) => v._id || v) || [],
    });
    setAuthors(data.authors || []);
    setPreviews({ thumbnail: data.thumbnailUrl });
    setFiles({ thumbnail: null, bookFile: null, authorImages: {} });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startDate: new Date().toISOString().split("T")[0],
      availableIn: "HARD_COPY",
      isActive: true,
      originalPrice: "",
      discountPrice: "",
      pricingNote: "",
      shortDescription: "",
      detailedDescription: "",
      categoryIds: [],
      subCategoryIds: [],
      languageIds: [],
      validityIds: [],
    });
    setAuthors([]);
    setNewAuthor({ name: "", qualification: "", subject: "" });
    setNewAuthorImage(null);
    setFiles({ thumbnail: null, bookFile: null, authorImages: {} });
    setPreviews({ thumbnail: null });
    setActiveTab("basic");
  };

  const loadDropdowns = async () => {
    try {
      const [catRes, langRes, valRes] = await Promise.all([
        categoryService.getAll(PUBLICATION_CONTENT_TYPE, true),
        languageService.getAll(),
        validityService.getAll(),
      ]);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(langRes.data.map((l) => ({ label: l.name, value: l._id })));
      setValidities(valRes.data.map((v) => ({ label: v.label, value: v._id })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const loadSub = async () => {
      if (formData.categoryIds?.length === 0) {
        setSubCategories([]);
        return;
      }
      try {
        const firstCatId = Array.isArray(formData.categoryIds)
          ? formData.categoryIds[0]
          : formData.categoryIds;
        if (!firstCatId) return;
        const res = await subCategoryService.getAll(
          PUBLICATION_CONTENT_TYPE,
          firstCatId,
        );
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadSub();
  }, [formData.categoryIds]);

  // --- Handlers ---
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelect = (field, val) =>
    setFormData((p) => ({ ...p, [field]: Array.isArray(val) ? val : [val] }));

  // File Handler
  const handleFile = (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((p) => ({ ...p, [key]: file }));
      if (key === "thumbnail")
        setPreviews((p) => ({ ...p, thumbnail: URL.createObjectURL(file) }));
    }
  };

  // --- DIRECT API ACTIONS (Edit Mode) ---

  // 1. Files
  const handleUpdateFile = async (type) => {
    if (!initialData?._id) return;
    try {
      setIsSubmitting(true);
      const data = new FormData();
      if (type === "thumbnail" && files.thumbnail) {
        data.append("thumbnail", files.thumbnail);
        const res = await publicationService.updateThumbnail(
          initialData._id,
          data,
        );
        populateForm(res.data); // Refresh data
        toast.success("Thumbnail updated!");
      } else if (type === "book" && files.bookFile) {
        data.append("bookFile", files.bookFile);
        const res = await publicationService.updateBook(initialData._id, data);
        populateForm(res.data);
        toast.success("Book file updated!");
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Authors
  const handleDirectAddAuthor = async () => {
    if (!newAuthor.name || !newAuthor.subject)
      return toast.error("Name and Subject required");
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("name", newAuthor.name);
      data.append("qualification", newAuthor.qualification);
      data.append("subject", newAuthor.subject);
      if (newAuthorImage) data.append("authorImage", newAuthorImage);

      const res = await publicationService.addAuthor(initialData._id, data);
      populateForm(res.data); // Refresh List
      setNewAuthor({ name: "", qualification: "", subject: "" });
      setNewAuthorImage(null);
      toast.success("Author added!");
    } catch (e) {
      toast.error("Failed to add author");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectUpdateAuthor = async (author) => {
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("name", author.name);
      data.append("qualification", author.qualification);
      data.append("subject", author.subject);
      // Note: If image is changed, it needs to be handled in local state mapping or separate input
      // For simplicity in this list view, we usually just update text unless a new file input is shown
      if (files.authorImages[author._id]) {
        data.append("authorImage", files.authorImages[author._id]);
      }

      const res = await publicationService.updateAuthor(
        initialData._id,
        author._id,
        data,
      );
      populateForm(res.data);
      toast.success("Author updated!");
    } catch (e) {
      toast.error("Failed to update author");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectDeleteAuthor = async (authorId) => {
    if (!window.confirm("Remove this author?")) return;
    try {
      setIsSubmitting(true);
      const res = await publicationService.deleteAuthor(
        initialData._id,
        authorId,
      );
      populateForm(res.data);
      toast.success("Author removed");
    } catch (e) {
      toast.error("Failed to remove");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOCAL ACTIONS (Create Mode) ---
  const addAuthorLocal = () =>
    setAuthors([...authors, { name: "", qualification: "", subject: "" }]);
  const updateAuthorLocal = (index, field, val) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = val;
    setAuthors(newAuthors);
  };
  const removeAuthorLocal = (index) =>
    setAuthors(authors.filter((_, i) => i !== index));

  // --- MAIN SUBMIT (Create & Basic Update) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      // Edit Mode: Only update basic fields via main patch
      onSubmit({ ...formData, _isEdit: true });
    } else {
      // Create Mode: Multipart
      const payload = { ...formData, authors };
      const data = new FormData();
      data.append("publication", JSON.stringify(payload));
      if (files.thumbnail) data.append("thumbnail", files.thumbnail);
      if (files.bookFile) data.append("bookFile", files.bookFile);
      Object.keys(files.authorImages).forEach((idx) => {
        data.append("authorImages", files.authorImages[idx]);
      });
      onSubmit(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            {initialData ? "Edit Publication" : "New Publication"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50">
          {["basic", "pricing", "classification", "authors", "files"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="pub-form" onSubmit={handleSubmit} className="space-y-6">
            {/* --- BASIC TAB --- */}
            {activeTab === "basic" && (
              <div className="grid gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ""}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Availability
                    </label>
                    <select
                      name="availableIn"
                      value={formData.availableIn}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="HARD_COPY">Hard Copy</option>
                      <option value="E_BOOK">E-Book</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Short Desc
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription || ""}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Detailed Desc
                  </label>
                  <textarea
                    name="detailedDescription"
                    value={formData.detailedDescription || ""}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* --- PRICING TAB --- */}
            {activeTab === "pricing" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Original Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice || ""}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Discount Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice || ""}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Pricing Note
                  </label>
                  <input
                    type="text"
                    name="pricingNote"
                    value={formData.pricingNote || ""}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* --- CLASSIFICATION TAB --- */}
            {activeTab === "classification" && (
              <div className="grid grid-cols-2 gap-6">
                <CustomDropdown
                  label="Category"
                  options={categories}
                  value={formData.categoryIds?.[0]}
                  onChange={(val) => handleSelect("categoryIds", val)}
                  placeholder="Select Category"
                  icon={Layers}
                  required
                />
                <CustomDropdown
                  label="Sub Category"
                  options={subCategories}
                  value={formData.subCategoryIds?.[0]}
                  onChange={(val) => handleSelect("subCategoryIds", val)}
                  placeholder="Select Sub Category"
                  icon={Layers}
                  disabled={!formData.categoryIds?.length}
                  required
                />
                <CustomDropdown
                  label="Language"
                  options={languages}
                  value={formData.languageIds?.[0]}
                  onChange={(val) => handleSelect("languageIds", val)}
                  placeholder="Select Language"
                  icon={FileText}
                  required
                />
                <CustomDropdown
                  label="Validity"
                  options={validities}
                  value={formData.validityIds?.[0]}
                  onChange={(val) => handleSelect("validityIds", val)}
                  placeholder="Select Validity"
                  icon={Layers}
                />
              </div>
            )}

            {/* --- AUTHORS TAB (Hybrid Mode) --- */}
            {activeTab === "authors" && (
              <div className="space-y-6">
                {/* LIST EXISTING (Edit Mode) OR DRAFT (Create Mode) */}
                <div className="space-y-3">
                  {authors.map((author, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={author.name}
                          onChange={(e) =>
                            updateAuthorLocal(index, "name", e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Subject"
                          value={author.subject}
                          onChange={(e) =>
                            updateAuthorLocal(index, "subject", e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Qual."
                          value={author.qualification}
                          onChange={(e) =>
                            updateAuthorLocal(
                              index,
                              "qualification",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        {/* Image Logic for Edit Mode */}
                        {initialData && (
                          <div className="flex items-center gap-2">
                            {author.photoUrl && (
                              <img
                                src={author.photoUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <input
                              type="file"
                              className="text-xs w-48"
                              onChange={(e) =>
                                setFiles((p) => ({
                                  ...p,
                                  authorImages: {
                                    ...p.authorImages,
                                    [author._id]: e.target.files[0],
                                  },
                                }))
                              }
                            />
                          </div>
                        )}
                        {!initialData && (
                          <input
                            type="file"
                            className="text-xs w-48"
                            onChange={(e) =>
                              setFiles((p) => ({
                                ...p,
                                authorImages: {
                                  ...p.authorImages,
                                  [index]: e.target.files[0],
                                },
                              }))
                            }
                          />
                        )}

                        <div className="flex items-center gap-2">
                          {initialData ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDirectUpdateAuthor(author)}
                                disabled={isSubmitting}
                                className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDirectDeleteAuthor(author._id)
                                }
                                disabled={isSubmitting}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeAuthorLocal(index)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD NEW (Different UI for Create vs Edit) */}
                {initialData ? (
                  <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">
                      Add New Author
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newAuthor.name}
                        onChange={(e) =>
                          setNewAuthor({ ...newAuthor, name: e.target.value })
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Subject"
                        value={newAuthor.subject}
                        onChange={(e) =>
                          setNewAuthor({
                            ...newAuthor,
                            subject: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Qual."
                        value={newAuthor.qualification}
                        onChange={(e) =>
                          setNewAuthor({
                            ...newAuthor,
                            qualification: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <input
                        type="file"
                        className="text-xs"
                        onChange={(e) => setNewAuthorImage(e.target.files[0])}
                      />
                      <button
                        type="button"
                        onClick={handleDirectAddAuthor}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={addAuthorLocal}
                    className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" /> Add Author Row
                  </button>
                )}
              </div>
            )}

            {/* --- FILES TAB (Interactive for Edit) --- */}
            {activeTab === "files" && (
              <div className="space-y-6">
                {/* THUMBNAIL */}
                <div className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/50">
                  <div className="flex items-start gap-4">
                    {previews.thumbnail ? (
                      <img
                        src={previews.thumbnail}
                        alt="Thumbnail"
                        className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        Thumbnail Image
                      </h4>
                      <input
                        type="file"
                        onChange={(e) => handleFile(e, "thumbnail")}
                        accept="image/*"
                        className="text-xs text-slate-500 mt-2 block w-full"
                      />
                      {initialData && files.thumbnail && (
                        <button
                          type="button"
                          onClick={() => handleUpdateFile("thumbnail")}
                          disabled={isSubmitting}
                          className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Update Thumbnail Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOOK FILE */}
                <div className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/50">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        Book PDF / Doc
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {initialData?.bookFileUrl
                          ? "File Exists"
                          : "No file uploaded"}
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFile(e, "bookFile")}
                        accept=".pdf,.doc,.docx"
                        className="text-xs text-slate-500 mt-2 block w-full"
                      />
                      {initialData && files.bookFile && (
                        <button
                          type="button"
                          onClick={() => handleUpdateFile("book")}
                          disabled={isSubmitting}
                          className="mt-3 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Update Book File Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {initialData && (
                  <p className="text-center text-xs text-slate-400 italic mt-4">
                    Note: File updates happen immediately when you click the
                    update button.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="submit"
            form="pub-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />{" "}
            {initialData ? "Save Changes" : "Create Publication"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicationModal;
