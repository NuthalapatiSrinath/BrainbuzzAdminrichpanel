import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";
import DatePicker from "../common/DatePicker";

// Services
import publicationService from "../../api/publicationService";
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
  const [formData, setFormData] = useState({
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

  // Local State for Authors & Gallery
  const [authors, setAuthors] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]); // URLs for edit mode

  // New Author State (For Edit Mode Adding)
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    qualification: "",
    subject: "",
  });
  const [newAuthorImage, setNewAuthorImage] = useState(null);

  // File States (For Create Mode / Single Updates)
  const [files, setFiles] = useState({
    thumbnail: null,
    bookFile: null,
    authorImages: {}, // Map index (create) or ID (edit) -> file
    galleryFiles: [], // Array of files for create mode or single file for add
  });

  const [previews, setPreviews] = useState({
    thumbnail: null,
    gallery: [],
  });

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
    const formattedDate = data.startDate
      ? new Date(data.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    setFormData({
      name: data.name || "",
      startDate: formattedDate,
      availableIn: data.availableIn || "HARD_COPY",
      isActive: data.isActive ?? true,
      originalPrice: data.originalPrice || "",
      discountPrice: data.discountPrice || "",
      pricingNote: data.pricingNote || "",
      shortDescription: data.shortDescription || "",
      detailedDescription: data.detailedDescription || "",
      categoryIds: data.categories?.map((c) => c._id || c) || [],
      subCategoryIds: data.subCategories?.map((s) => s._id || s) || [],
      languageIds: data.languages?.map((l) => l._id || l) || [],
      validityIds: data.validities?.map((v) => v._id || v) || [],
    });

    setAuthors(data.authors || []);
    setGalleryImages(data.galleryImages || []);
    setPreviews({ thumbnail: data.thumbnailUrl });
    setFiles({
      thumbnail: null,
      bookFile: null,
      authorImages: {},
      galleryFiles: [],
    });
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
    setGalleryImages([]);
    setNewAuthor({ name: "", qualification: "", subject: "" });
    setNewAuthorImage(null);
    setFiles({
      thumbnail: null,
      bookFile: null,
      authorImages: {},
      galleryFiles: [],
    });
    setPreviews({ thumbnail: null, gallery: [] });
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
      toast.error("Error loading dropdowns");
    }
  };

  // Dependent SubCategory Fetch
  useEffect(() => {
    const loadSub = async () => {
      if (!formData.categoryIds?.length) {
        setSubCategories([]);
        return;
      }
      try {
        const firstCatId = Array.isArray(formData.categoryIds)
          ? formData.categoryIds[0]
          : formData.categoryIds;
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
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDropdownChange = (field, value) => {
    const arrayValue = Array.isArray(value) ? value : [value];
    setFormData((prev) => {
      const updates = { ...prev, [field]: arrayValue };
      if (field === "categoryIds") updates.subCategoryIds = [];
      return updates;
    });
  };

  // Multi-Select Toggle Handler (Languages/Validity)
  const handleToggle = (field, id) => {
    setFormData((p) => {
      const current = p[field] || [];
      const newVals = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...p, [field]: newVals };
    });
  };

  const handleFile = (e, key) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((p) => ({ ...p, [key]: file }));
      if (key === "thumbnail")
        setPreviews((p) => ({ ...p, thumbnail: URL.createObjectURL(file) }));
    }
  };

  // Author Handlers (Create Mode)
  const addAuthorRow = () =>
    setAuthors([...authors, { name: "", qualification: "", subject: "" }]);
  const removeAuthorRow = (idx) =>
    setAuthors(authors.filter((_, i) => i !== idx));
  const updateAuthorRow = (idx, field, value) => {
    const updated = [...authors];
    updated[idx][field] = value;
    setAuthors(updated);
  };
  const handleAuthorImage = (idx, file) => {
    setFiles((p) => ({
      ...p,
      authorImages: { ...p.authorImages, [idx]: file },
    }));
  };

  // --- API ACTIONS (Edit Mode Direct Updates) ---

  // 1. Single File Updates
  const handleUpdateFile = async (type) => {
    if (!initialData?._id) return;
    const loadingToast = toast.loading(`Updating ${type}...`);
    try {
      setIsSubmitting(true);
      let res;
      if (type === "thumbnail" && files.thumbnail) {
        res = await publicationService.updateThumbnail(
          initialData._id,
          files.thumbnail,
        );
        setPreviews((p) => ({ ...p, thumbnail: res.data.thumbnailUrl }));
      } else if (type === "book" && files.bookFile) {
        res = await publicationService.updateBook(
          initialData._id,
          files.bookFile,
        );
      }
      toast.success(`${type} updated!`, { id: loadingToast });
      // Refresh parent if needed
      if (onSubmit && res?.data)
        onSubmit({ _isEdit: true, _refreshOnly: true });
    } catch (e) {
      toast.error("Update failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Authors (Create vs Edit Logic)

  // API: Add Author
  const apiAddAuthor = async () => {
    if (!newAuthor.name || !newAuthor.subject)
      return toast.error("Name & Subject required");
    const loadingToast = toast.loading("Adding author...");
    try {
      setIsSubmitting(true);
      const payload = { ...newAuthor, photo: newAuthorImage };
      const res = await publicationService.addAuthor(initialData._id, payload);
      setAuthors(res.data.authors || []);
      setNewAuthor({ name: "", qualification: "", subject: "" });
      setNewAuthorImage(null);
      toast.success("Author added!", { id: loadingToast });
    } catch (e) {
      toast.error("Failed to add author", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // API: Update Existing Author
  const apiUpdateAuthor = async (author, index) => {
    const loadingToast = toast.loading("Updating author...");
    try {
      setIsSubmitting(true);
      // Check if there's a new file in files.authorImages keyed by ID
      const photoFile = files.authorImages[author._id];
      const payload = {
        name: author.name,
        qualification: author.qualification,
        subject: author.subject,
        photo: photoFile,
      };
      const res = await publicationService.updateAuthor(
        initialData._id,
        author._id,
        payload,
      );
      setAuthors(res.data.authors || []);
      toast.success("Author updated!", { id: loadingToast });
    } catch (e) {
      toast.error("Update failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // API: Delete Author
  const apiDeleteAuthor = async (authorId) => {
    if (!window.confirm("Remove this author?")) return;
    const loadingToast = toast.loading("Removing author...");
    try {
      setIsSubmitting(true);
      const res = await publicationService.deleteAuthor(
        initialData._id,
        authorId,
      );
      setAuthors(res.data.authors || []);
      toast.success("Author removed", { id: loadingToast });
    } catch (e) {
      toast.error("Removal failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Gallery (Create vs Edit Logic)

  // API: Add Image
  const apiAddGalleryImage = async () => {
    if (!files.galleryFiles[0]) return toast.error("Select an image first");
    const loadingToast = toast.loading("Uploading image...");
    try {
      setIsSubmitting(true);
      const res = await publicationService.addImage(
        initialData._id,
        files.galleryFiles[0],
      );
      setGalleryImages(res.data.galleryImages || []);
      setFiles((p) => ({ ...p, galleryFiles: [] }));
      toast.success("Image added!", { id: loadingToast });
    } catch (e) {
      toast.error("Upload failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // API: Remove Image
  const apiRemoveGalleryImage = async (url) => {
    if (!window.confirm("Delete this image?")) return;
    const loadingToast = toast.loading("Deleting image...");
    try {
      setIsSubmitting(true);
      const res = await publicationService.removeImage(initialData._id, url);
      setGalleryImages(res.data.galleryImages || []);
      toast.success("Image deleted", { id: loadingToast });
    } catch (e) {
      toast.error("Delete failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // API: Update Classification (Categories/SubCategories)
  const handleUpdateClassification = async () => {
    if (!initialData?._id) return;
    const loadingToast = toast.loading("Updating classification...");
    try {
      setIsSubmitting(true);
      const res = await publicationService.updateCategories(
        initialData._id,
        formData.categoryIds,
        formData.subCategoryIds,
      );
      toast.success("Classification updated", { id: loadingToast });
      if (onSubmit && res?.data)
        onSubmit({ _isEdit: true, _refreshOnly: true });
    } catch (e) {
      toast.error("Failed to update", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Main Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.group("🚀 Submitting Publication");

    // Validation
    if (!formData.name) {
      console.groupEnd();
      return toast.error("Name is required");
    }
    if (!formData.categoryIds?.length) {
      console.groupEnd();
      return toast.error("Category is required");
    }
    if (!formData.originalPrice) {
      console.groupEnd();
      return toast.error("Price is required");
    }

    const payload = {
      ...formData,
      authors,
      thumbnail: files.thumbnail,
      bookFile: files.bookFile,
      authorImages: files.authorImages,
      galleryImages: files.galleryFiles,
    };

    console.log("📦 Payload:", payload);
    onSubmit(payload);
    console.groupEnd();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 text-white"
          style={{ background: "var(--color-brand-blue)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">
              {initialData ? "Edit Publication" : "New Publication"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
          {[
            { id: "basic", label: "Basic Info", icon: FileText },
            { id: "pricing", label: "Pricing", icon: DollarSign },
            { id: "classification", label: "Classification", icon: Layers },
            { id: "authors", label: "Authors", icon: User },
            { id: "gallery", label: "Gallery", icon: ImageIcon },
            { id: "files", label: "Files", icon: Upload },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-4 text-sm font-bold capitalize transition-all flex items-center justify-center gap-2 relative ${
                activeTab === tab.id
                  ? "text-[var(--color-brand-blue)] bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[var(--color-brand-blue)]" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          <form id="pub-form" onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC INFO */}
            {activeTab === "basic" && (
              <div className="grid gap-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="Start Date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Format
                    </label>
                    <select
                      name="availableIn"
                      value={formData.availableIn}
                      onChange={handleChange}
                      className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="HARD_COPY">Hard Copy</option>
                      <option value="E_BOOK">E-Book</option>
                      <option value="PUBLICATION">Publication</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Short Description
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    name="detailedDescription"
                    value={formData.detailedDescription}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 accent-green-600"
                  />
                  <label className="text-sm font-bold text-slate-700">
                    Publish Immediately
                  </label>
                </div>
              </div>
            )}

            {/* 2. PRICING */}
            {activeTab === "pricing" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Original Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      className="w-full pl-8 p-2.5 border rounded-xl outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Discount Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleChange}
                      className="w-full pl-8 p-2.5 border rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Pricing Note
                  </label>
                  <input
                    name="pricingNote"
                    value={formData.pricingNote}
                    onChange={handleChange}
                    className="w-full border p-2.5 rounded-xl outline-none focus:border-blue-500"
                    placeholder="e.g. Special Offer"
                  />
                </div>
              </div>
            )}

            {/* 3. CLASSIFICATION */}
            {activeTab === "classification" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <CustomDropdown
                    label="Category"
                    options={categories}
                    value={formData.categoryIds?.[0]}
                    onChange={(v) => handleDropdownChange("categoryIds", v)}
                    placeholder="Select Category"
                    required
                  />
                  <CustomDropdown
                    label="Sub Category"
                    options={subCategories}
                    value={formData.subCategoryIds?.[0]}
                    onChange={(v) => handleDropdownChange("subCategoryIds", v)}
                    placeholder="Select Sub Category"
                    disabled={!formData.categoryIds?.length}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <button
                        type="button"
                        key={l._id}
                        onClick={() => handleToggle("languageIds", l._id)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${formData.languageIds.includes(l._id) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 hover:border-blue-300"}`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Validities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {validities.map((v) => (
                      <button
                        type="button"
                        key={v._id}
                        onClick={() => handleToggle("validityIds", v._id)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${formData.validityIds.includes(v._id) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 hover:border-purple-300"}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dedicated Update Button for Classification in Edit Mode */}
                {initialData && (
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleUpdateClassification}
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}{" "}
                      Update Classification
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. AUTHORS */}
            {activeTab === "authors" && (
              <div className="space-y-4">
                {/* List Existing Authors */}
                {authors.map((author, index) => (
                  <div
                    key={initialData ? author._id : index}
                    className="p-4 border rounded-xl bg-slate-50 grid md:grid-cols-2 gap-3 relative"
                  >
                    {initialData ? (
                      <>
                        {/* API DELETE */}
                        <button
                          type="button"
                          onClick={() => apiDeleteAuthor(author._id)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                        {/* API UPDATE BUTTON */}
                        <button
                          type="button"
                          onClick={() => apiUpdateAuthor(author, index)}
                          className="absolute top-2 right-8 text-blue-400 hover:text-blue-600"
                        >
                          <Save size={16} />
                        </button>

                        {/* Fields for Edit */}
                        <input
                          placeholder="Name"
                          value={author.name}
                          onChange={(e) => {
                            const newAuthors = [...authors];
                            newAuthors[index].name = e.target.value;
                            setAuthors(newAuthors);
                          }}
                          className="border p-2 rounded-lg text-sm"
                        />
                        <input
                          placeholder="Subject"
                          value={author.subject}
                          onChange={(e) => {
                            const newAuthors = [...authors];
                            newAuthors[index].subject = e.target.value;
                            setAuthors(newAuthors);
                          }}
                          className="border p-2 rounded-lg text-sm"
                        />
                        <input
                          placeholder="Qualification"
                          value={author.qualification}
                          onChange={(e) => {
                            const newAuthors = [...authors];
                            newAuthors[index].qualification = e.target.value;
                            setAuthors(newAuthors);
                          }}
                          className="border p-2 rounded-lg text-sm md:col-span-2"
                        />

                        {/* Author Image Edit */}
                        <div className="md:col-span-2 flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500">
                            Photo:
                          </label>
                          {author.photoUrl && (
                            <img
                              src={author.photoUrl}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              // Store file in state map keyed by ID
                              setFiles((p) => ({
                                ...p,
                                authorImages: {
                                  ...p.authorImages,
                                  [author._id]: e.target.files[0],
                                },
                              }));
                            }}
                            className="text-xs"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* LOCAL DELETE (Create Mode) */}
                        <button
                          type="button"
                          onClick={() => removeAuthorRow(index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                        <input
                          placeholder="Name"
                          value={author.name}
                          onChange={(e) =>
                            updateAuthorRow(index, "name", e.target.value)
                          }
                          className="border p-2 rounded-lg text-sm"
                        />
                        <input
                          placeholder="Subject"
                          value={author.subject}
                          onChange={(e) =>
                            updateAuthorRow(index, "subject", e.target.value)
                          }
                          className="border p-2 rounded-lg text-sm"
                        />
                        <input
                          placeholder="Qualification"
                          value={author.qualification}
                          onChange={(e) =>
                            updateAuthorRow(
                              index,
                              "qualification",
                              e.target.value,
                            )
                          }
                          className="border p-2 rounded-lg text-sm md:col-span-2"
                        />
                        <div className="md:col-span-2 flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500">
                            Photo:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleAuthorImage(index, e.target.files[0])
                            }
                            className="text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add New Author UI */}
                {initialData ? (
                  <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">
                      Add New Author
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <input
                        placeholder="Name"
                        value={newAuthor.name}
                        onChange={(e) =>
                          setNewAuthor({ ...newAuthor, name: e.target.value })
                        }
                        className="border p-2 rounded text-sm"
                      />
                      <input
                        placeholder="Subject"
                        value={newAuthor.subject}
                        onChange={(e) =>
                          setNewAuthor({
                            ...newAuthor,
                            subject: e.target.value,
                          })
                        }
                        className="border p-2 rounded text-sm"
                      />
                      <input
                        placeholder="Qualification"
                        value={newAuthor.qualification}
                        onChange={(e) =>
                          setNewAuthor({
                            ...newAuthor,
                            qualification: e.target.value,
                          })
                        }
                        className="border p-2 rounded text-sm"
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
                        onClick={apiAddAuthor}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                      >
                        Add Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={addAuthorRow}
                    className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Author Row
                  </button>
                )}
              </div>
            )}

            {/* 5. GALLERY TAB */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                {initialData ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {galleryImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border"
                        >
                          <img src={url} className="w-full h-32 object-cover" />
                          <button
                            type="button"
                            onClick={() => apiRemoveGalleryImage(url)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 items-center p-4 bg-slate-50 rounded-xl border border-dashed">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFiles((p) => ({
                            ...p,
                            galleryFiles: [e.target.files[0]],
                          }))
                        }
                        className="text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={apiAddGalleryImage}
                        disabled={!files.galleryFiles.length}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold"
                      >
                        Upload
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 border-2 border-dashed rounded-xl text-center bg-slate-50">
                    <p className="text-sm text-slate-500 mb-4">
                      Select multiple images for the gallery
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setFiles((p) => ({
                          ...p,
                          galleryFiles: Array.from(e.target.files),
                        }))
                      }
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-indigo-50 file:text-indigo-700 file:border-0 hover:file:bg-indigo-100"
                    />
                    {files.galleryFiles.length > 0 && (
                      <p className="mt-2 text-xs text-green-600">
                        {files.galleryFiles.length} images selected
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. FILES TAB */}
            {activeTab === "files" && (
              <div className="space-y-6">
                {/* Thumbnail */}
                <div className="border p-4 rounded-xl flex gap-4 bg-slate-50">
                  {previews.thumbnail ? (
                    <img
                      src={previews.thumbnail}
                      className="w-16 h-16 object-contain bg-white rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                      <ImageIcon />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="text-sm font-bold block mb-1">
                      Thumbnail
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile(e, "thumbnail")}
                      className="text-xs w-full"
                    />
                    {initialData && (
                      <button
                        type="button"
                        onClick={() => handleUpdateFile("thumbnail")}
                        disabled={!files.thumbnail}
                        className="mt-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>

                {/* Book File */}
                <div className="border p-4 rounded-xl flex gap-4 bg-slate-50">
                  <div className="w-16 h-16 bg-green-50 rounded flex items-center justify-center text-green-600">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-bold block mb-1">
                      Book PDF/Doc
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFile(e, "bookFile")}
                      className="text-xs w-full"
                    />
                    {initialData && (
                      <button
                        type="button"
                        onClick={() => handleUpdateFile("book")}
                        disabled={!files.bookFile}
                        className="mt-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Update File
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>

          {/* Main Submit: For Create OR Basic Info Edit */}
          {(activeTab === "basic" ||
            activeTab === "pricing" ||
            (!initialData &&
              activeTab !== "files" &&
              activeTab !== "gallery")) && (
            <button
              type="submit"
              form="pub-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 font-bold text-white bg-[var(--color-brand-blue)] rounded-xl hover:opacity-90 shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? "Save Changes" : "Create Publication"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PublicationModal;
