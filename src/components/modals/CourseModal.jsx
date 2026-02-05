import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Plus,
  Trash2,
  Video,
  Image,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSubCategories } from "../../store/slices/subCategorySlice";
import { fetchLanguages } from "../../store/slices/languageSlice";
import { fetchValidities } from "../../store/slices/validitySlice";
import { createCourse, updateCourse } from "../../store/slices/courseSlice";
import CustomDropdown from "../common/CustomDropdown";

const CourseModal = ({ isOpen, onClose, course = null, onSuccess }) => {
  const dispatch = useDispatch();

  // --- Redux Data ---
  const { categories = [] } = useSelector((state) => state.category || {});
  const { subCategories = [] } = useSelector(
    (state) => state.subCategory || {},
  );
  const { items: languages = [] } = useSelector(
    (state) => state.languages || {},
  );
  const { items: validities = [] } = useSelector(
    (state) => state.validities || {},
  );
  const { loading } = useSelector((state) => state.courses);

  // --- Local State ---
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    courseType: "",
    startDate: "",
    categoryId: "",
    subCategoryId: "",
    languageIds: [],
    validityIds: [],
    originalPrice: "",
    discountPrice: "",
    accessType: "PAID",
    pricingNote: "",
    shortDescription: "",
    detailedDescription: "",
    thumbnail: null,
    thumbnailPreview: null,
    isActive: true,
  });

  // Complex Arrays
  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

  // --- 1. Load Dependencies ---
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories({ contentType: "ONLINE_COURSE" }));
      dispatch(fetchSubCategories({ contentType: "ONLINE_COURSE" }));
      dispatch(fetchLanguages());
      dispatch(fetchValidities());
    }
  }, [isOpen, dispatch]);

  // --- 2. Populate Data (Edit Mode) ---
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || "",
        courseType: course.courseType || "",
        startDate: course.startDate ? course.startDate.split("T")[0] : "",
        categoryId: course.categories?.[0]?._id || course.categories?.[0] || "",
        subCategoryId:
          course.subCategories?.[0]?._id || course.subCategories?.[0] || "",
        languageIds: course.languages?.map((l) => l._id || l) || [],
        validityIds: course.validities?.map((v) => v._id || v) || [],
        originalPrice: course.originalPrice || "",
        discountPrice: course.discountPrice || "",
        accessType: course.accessType || "PAID",
        pricingNote: course.pricingNote || "",
        shortDescription: course.shortDescription || "",
        detailedDescription: course.detailedDescription || "",
        thumbnailPreview: course.thumbnailUrl || null,
        thumbnail: null,
        isActive: course.isActive !== undefined ? course.isActive : true,
      });

      setTutors(
        course.tutors?.map((t) => ({ ...t, photoPreview: t.photoUrl })) || [],
      );
      setClasses(
        course.classes?.map((c) => ({
          ...c,
          thumbnailPreview: c.thumbnailUrl,
          lecturePhotoPreview: c.lecturePhotoUrl,
          videoPreview: c.videoUrl,
        })) || [],
      );
      setStudyMaterials(
        course.studyMaterials?.map((m) => ({ ...m, filePreview: m.fileUrl })) ||
          [],
      );
    } else {
      resetForm();
    }
  }, [course]);

  const resetForm = () => {
    setFormData({
      name: "",
      courseType: "",
      startDate: "",
      categoryId: "",
      subCategoryId: "",
      languageIds: [],
      validityIds: [],
      originalPrice: "",
      discountPrice: "",
      accessType: "PAID",
      pricingNote: "",
      shortDescription: "",
      detailedDescription: "",
      thumbnail: null,
      thumbnailPreview: null,
      isActive: true,
    });
    setTutors([]);
    setClasses([]);
    setStudyMaterials([]);
    setActiveTab("basic");
  };

  // --- 3. Filtering Options (Cascading) ---
  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat._id })),
    [categories],
  );

  const subCategoryOptions = useMemo(() => {
    if (!formData.categoryId) return [];
    const filtered = subCategories.filter((sub) => {
      const parentId = sub.category?._id || sub.category;
      return parentId === formData.categoryId;
    });
    return filtered.map((sub) => ({ label: sub.name, value: sub._id }));
  }, [subCategories, formData.categoryId]);

  // --- 4. Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  // --- 5. Complex Array Handlers ---
  const addTutor = () => {
    setTutors([
      ...tutors,
      {
        name: "",
        subject: "",
        qualification: "",
        photo: null,
        photoPreview: null,
      },
    ]);
  };
  const updateTutor = (index, field, value) => {
    const updated = [...tutors];
    if (field === "photo") {
      updated[index].photo = value;
      updated[index].photoPreview = URL.createObjectURL(value);
    } else {
      updated[index][field] = value;
    }
    setTutors(updated);
  };
  const removeTutor = (index) =>
    setTutors(tutors.filter((_, i) => i !== index));

  const addClass = () => {
    setClasses([
      ...classes,
      {
        title: "",
        topic: "",
        order: classes.length + 1,
        isFree: false,
        video: null,
        thumbnail: null,
        lecturePhoto: null,
      },
    ]);
  };
  const updateClass = (index, field, value) => {
    const updated = [...classes];
    if (["video", "thumbnail", "lecturePhoto"].includes(field)) {
      updated[index][field] = value;
      updated[index][`${field}Preview`] = URL.createObjectURL(value);
    } else {
      updated[index][field] = value;
    }
    setClasses(updated);
  };
  const removeClass = (index) =>
    setClasses(classes.filter((_, i) => i !== index));

  const addMaterial = () => {
    setStudyMaterials([
      ...studyMaterials,
      { title: "", description: "", file: null },
    ]);
  };
  const updateMaterial = (index, field, value) => {
    const updated = [...studyMaterials];
    if (field === "file") {
      updated[index].file = value;
      updated[index].filePreview = value.name;
    } else {
      updated[index][field] = value;
    }
    setStudyMaterials(updated);
  };
  const removeMaterial = (index) =>
    setStudyMaterials(studyMaterials.filter((_, i) => i !== index));

  // --- 6. Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group("🚀 Course Form Submission");

    // Validation
    if (!formData.name) {
      alert("Course name is required");
      console.groupEnd();
      return;
    }
    if (!formData.categoryId) {
      alert("Category is required");
      console.groupEnd();
      return;
    }

    // ✅ FIX 1: Handle FREE vs PAID pricing logic before sending
    let finalOriginalPrice = parseFloat(formData.originalPrice) || 0;
    let finalDiscountPrice = parseFloat(formData.discountPrice) || 0;

    if (formData.accessType === "FREE") {
      finalOriginalPrice = 0;
      finalDiscountPrice = 0;
    } else if (finalOriginalPrice <= 0) {
      // If PAID but price is 0 or invalid
      alert("Paid courses must have an original price greater than 0");
      console.groupEnd();
      return;
    }

    // Calculate Discount Percent
    let discountPercent = 0;
    if (
      finalOriginalPrice > 0 &&
      finalDiscountPrice > 0 &&
      finalDiscountPrice < finalOriginalPrice
    ) {
      discountPercent = Math.round(
        ((finalOriginalPrice - finalDiscountPrice) / finalOriginalPrice) * 100,
      );
    }

    // Construct Payload
    const coursePayload = {
      ...formData,
      originalPrice: finalOriginalPrice,
      discountPrice: finalDiscountPrice,
      categoryIds: formData.categoryId ? [formData.categoryId] : [],
      subCategoryIds: formData.subCategoryId ? [formData.subCategoryId] : [],
      discountPercent,
      tutors,
      classes,
      studyMaterials,
    };

    console.log("📦 Payload prepared:", coursePayload);

    try {
      if (course) {
        await dispatch(
          updateCourse({ id: course._id, courseData: coursePayload }),
        ).unwrap();
      } else {
        await dispatch(createCourse(coursePayload)).unwrap();
      }
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("❌ API Error:", error);
      alert(
        `Operation failed: ${typeof error === "string" ? error : "Server Error"}`,
      );
    } finally {
      console.groupEnd();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden m-4">
        {/* --- HEADER --- */}
        <div
          className="p-4 flex justify-between items-center z-10 shadow-md text-white shrink-0"
          style={{ background: "var(--color-brand-blue)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Video className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {course ? "Edit Online Course" : "Create New Course"}
              </h2>
              <p className="text-xs text-blue-100 opacity-90">
                Fill in the details below
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          {[
            { key: "basic", label: "Basic Info", icon: "📝" },
            { key: "tutors", label: "Tutors", icon: "👨‍🏫" },
            { key: "classes", label: "Classes", icon: "🎓" },
            { key: "materials", label: "Materials", icon: "📚" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-4 font-bold transition-all duration-300 flex items-center justify-center gap-2 relative ${
                activeTab === tab.key
                  ? "text-[var(--color-brand-blue)] bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                  style={{ background: "var(--color-brand-blue)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* --- FORM CONTENT --- */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-slate-50/50"
        >
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {/* 1. BASIC INFO TAB */}
            {activeTab === "basic" && (
              <div className="space-y-8">
                {/* Course Name Section */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                    <span className="text-xl">📝</span>
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold text-slate-800 text-lg"
                    required
                    placeholder="e.g. Complete Web Development Bootcamp"
                  />
                </div>

                {/* Category Section */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-lg">🗂️</span>
                    Category & Classification
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <CustomDropdown
                      label="📂 Category *"
                      value={formData.categoryId}
                      onChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: v,
                          subCategoryId: "",
                        }))
                      }
                      options={categoryOptions}
                      searchable
                      required
                    />
                    <CustomDropdown
                      label="📋 Sub Category"
                      value={formData.subCategoryId}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, subCategoryId: v }))
                      }
                      options={subCategoryOptions}
                      placeholder={
                        formData.categoryId
                          ? "Select Sub Category"
                          : "Select Category first"
                      }
                      searchable
                      disabled={!formData.categoryId}
                    />
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <span className="text-lg">🎯</span>
                        Course Type
                      </label>
                      <input
                        type="text"
                        name="courseType"
                        value={formData.courseType}
                        onChange={handleInputChange}
                        placeholder="e.g. Live Batch, Recorded, Hybrid"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <span className="text-lg">📅</span>
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
                    Pricing & Access
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <label
                        className={`flex-1 cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${formData.accessType === "FREE" ? "border-green-500 bg-green-50" : "border-slate-200"}`}
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value="FREE"
                          checked={formData.accessType === "FREE"}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="text-2xl">🎁</span>
                        <div>
                          <div className="font-bold text-slate-800">Free</div>
                          <div className="text-xs text-slate-500">No cost</div>
                        </div>
                      </label>
                      <label
                        className={`flex-1 cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${formData.accessType === "PAID" ? "border-[var(--color-brand-blue)] bg-blue-50" : "border-slate-200"}`}
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value="PAID"
                          checked={formData.accessType === "PAID"}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="text-2xl">💎</span>
                        <div>
                          <div className="font-bold text-slate-800">Paid</div>
                          <div className="text-xs text-slate-500">Premium</div>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">
                          Original Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleInputChange}
                            className="w-full pl-8 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
                            placeholder="0"
                            disabled={formData.accessType === "FREE"}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">
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
                            onChange={handleInputChange}
                            className="w-full pl-8 py-2 border border-slate-300 rounded-lg font-bold text-green-600"
                            placeholder="0"
                            disabled={formData.accessType === "FREE"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages & Validities */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    Languages & Duration
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <span className="text-lg">🌍</span>
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                          <button
                            key={lang._id}
                            type="button"
                            onClick={() =>
                              handleMultiSelect("languageIds", lang._id)
                            }
                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all transform hover:scale-105 ${formData.languageIds.includes(lang._id) ? "bg-[var(--color-brand-blue)] text-white border-[var(--color-brand-blue)] shadow-md" : "bg-white text-slate-600 border-slate-300 hover:border-blue-300"}`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <span className="text-lg">⏰</span>
                        Validities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {validities.map((val) => (
                          <button
                            key={val._id}
                            type="button"
                            onClick={() =>
                              handleMultiSelect("validityIds", val._id)
                            }
                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all transform hover:scale-105 ${formData.validityIds.includes(val._id) ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-slate-600 border-slate-300 hover:border-purple-300"}`}
                          >
                            {val.label || `${val.durationInDays} days`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                    <span className="text-xl">🖼️</span>
                    Course Thumbnail
                  </label>
                  <div className="flex items-center gap-6 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:border-blue-400 transition-all">
                    {formData.thumbnailPreview ? (
                      <img
                        src={formData.thumbnailPreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-white"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center text-slate-400 shadow-inner">
                        <Image size={40} />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[var(--color-brand-blue)] file:text-white hover:file:bg-[var(--color-brand-blue-dark)] file:transition-colors file:cursor-pointer"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Recommended: 1920x1080px (16:9 ratio)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    Course Descriptions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <span className="text-lg">📝</span>
                        Short Description
                      </label>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Brief overview of the course (1-2 sentences)"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <span className="text-lg">📖</span>
                        Detailed Description
                      </label>
                      <textarea
                        name="detailedDescription"
                        value={formData.detailedDescription}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Comprehensive course details, what students will learn, and prerequisites"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-6 h-6 accent-[var(--color-brand-green)] cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          Publish Immediately
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Course will be visible to users upon creation
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 2. TUTORS TAB */}
            {activeTab === "tutors" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Course Tutors
                    </h3>
                    <p className="text-sm text-slate-500">
                      Add instructors teaching this course
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTutor}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} /> Add Tutor
                  </button>
                </div>

                {tutors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">👨‍🏫</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">
                      No Tutors Added Yet
                    </h4>
                    <p className="text-sm text-slate-500 text-center max-w-md">
                      Click "Add Tutor" to include instructors who will teach
                      this course.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tutors.map((tutor, index) => (
                      <div
                        key={index}
                        className="group relative p-6 border-2 border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300"
                      >
                        <div className="absolute top-4 right-4">
                          <button
                            type="button"
                            onClick={() => removeTutor(index)}
                            className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                            title="Remove Tutor"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-2xl">👨‍🏫</span>
                          <h4 className="font-bold text-slate-700 text-lg">
                            Tutor #{index + 1}
                          </h4>
                        </div>

                        <div className="pr-12">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                👤 Full Name *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Dr. John Smith"
                                value={tutor.name}
                                onChange={(e) =>
                                  updateTutor(index, "name", e.target.value)
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                📚 Subject/Expertise
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Mathematics, Physics"
                                value={tutor.subject}
                                onChange={(e) =>
                                  updateTutor(index, "subject", e.target.value)
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                🎓 Qualifications
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., PhD in Computer Science, 10+ years experience"
                                value={tutor.qualification}
                                onChange={(e) =>
                                  updateTutor(
                                    index,
                                    "qualification",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">
                              📷 Profile Photo
                            </label>
                            <div className="flex items-center gap-4">
                              {tutor.photoPreview ? (
                                <img
                                  src={tutor.photoPreview}
                                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                  alt="Tutor"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400 shadow-inner">
                                  <span className="text-3xl">👤</span>
                                </div>
                              )}
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                    <Plus
                                      size={20}
                                      className="text-slate-600 group-hover:text-indigo-600"
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">
                                    Upload Photo
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    updateTutor(
                                      index,
                                      "photo",
                                      e.target.files[0],
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. CLASSES TAB */}
            {activeTab === "classes" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Course Classes
                    </h3>
                    <p className="text-sm text-slate-500">
                      Add lectures and video content for the course
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addClass}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} /> Add Class
                  </button>
                </div>

                {classes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">🎓</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">
                      No Classes Added Yet
                    </h4>
                    <p className="text-sm text-slate-500 text-center max-w-md">
                      Click "Add Class" to create lectures and upload video
                      content for your course.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes.map((cls, index) => (
                      <div
                        key={index}
                        className="group relative p-6 border-2 border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300"
                      >
                        <div className="absolute top-4 right-4">
                          <button
                            type="button"
                            onClick={() => removeClass(index)}
                            className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                            title="Remove Class"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-2xl">🎓</span>
                          <h4 className="font-bold text-slate-700 text-lg">
                            Class #{index + 1}
                          </h4>
                        </div>
                        <div className="pr-12">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                📌 Class Title *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Introduction to Variables"
                                value={cls.title}
                                onChange={(e) =>
                                  updateClass(index, "title", e.target.value)
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                📝 Topic
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Python Basics"
                                value={cls.topic}
                                onChange={(e) =>
                                  updateClass(index, "topic", e.target.value)
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                  🔢 Order
                                </label>
                                <input
                                  type="number"
                                  placeholder="1"
                                  value={cls.order}
                                  onChange={(e) =>
                                    updateClass(index, "order", e.target.value)
                                  }
                                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-slate-800"
                                />
                              </div>
                              <label className="flex items-center gap-3 px-4 py-3 border-2 border-slate-300 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all group">
                                <input
                                  type="checkbox"
                                  checked={cls.isFree}
                                  onChange={(e) =>
                                    updateClass(
                                      index,
                                      "isFree",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-5 h-5 accent-green-600 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-slate-700 group-hover:text-green-700">
                                  🎁 Free Preview
                                </span>
                              </label>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">
                                🎬 Video File
                              </label>
                              <label className="cursor-pointer">
                                <div className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-400 transition-all group">
                                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                    <Video
                                      size={20}
                                      className="text-slate-600 group-hover:text-purple-600"
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-600 group-hover:text-purple-600">
                                    Upload Video
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) =>
                                    updateClass(
                                      index,
                                      "video",
                                      e.target.files[0],
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                              {cls.videoPreview && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                      <span className="text-lg">✅</span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-bold text-slate-700">
                                        Video Ready
                                      </div>
                                      {typeof cls.videoPreview === "string" &&
                                        cls.videoPreview.startsWith("http") && (
                                          <a
                                            href={cls.videoPreview}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                          >
                                            <Video size={12} /> View Video{" "}
                                            <ExternalLink size={10} />
                                          </a>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">
                                🖼️ Thumbnail
                              </label>
                              <label className="cursor-pointer">
                                <div className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                    <Image
                                      size={20}
                                      className="text-slate-600 group-hover:text-blue-600"
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">
                                    Upload Thumbnail
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    updateClass(
                                      index,
                                      "thumbnail",
                                      e.target.files[0],
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                              {cls.thumbnailPreview && (
                                <div className="mt-3 flex items-center gap-3">
                                  <img
                                    src={cls.thumbnailPreview}
                                    className="w-24 h-24 object-contain rounded-lg border-4 border-white shadow-lg bg-slate-50"
                                    alt="Thumbnail"
                                  />
                                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                                    <span className="text-sm">✓</span>
                                    <span className="text-xs font-bold">
                                      Uploaded
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">
                                📸 Lecture Photo
                              </label>
                              <label className="cursor-pointer">
                                <div className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                    <Image
                                      size={20}
                                      className="text-slate-600 group-hover:text-blue-600"
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">
                                    Upload Photo
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    updateClass(
                                      index,
                                      "lecturePhoto",
                                      e.target.files[0],
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                              {cls.lecturePhotoPreview && (
                                <div className="mt-3 flex items-center gap-3">
                                  <img
                                    src={cls.lecturePhotoPreview}
                                    className="w-24 h-24 object-contain rounded-lg border-4 border-white shadow-lg bg-slate-50"
                                    alt="Lecture Photo"
                                  />
                                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                                    <span className="text-sm">✓</span>
                                    <span className="text-xs font-bold">
                                      Uploaded
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. MATERIALS TAB */}
            {activeTab === "materials" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Study Materials
                    </h3>
                    <p className="text-sm text-slate-500">
                      Add course materials for students
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} /> Add Material
                  </button>
                </div>

                {studyMaterials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">📚</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">
                      No Materials Added Yet
                    </h4>
                    <p className="text-sm text-slate-500 text-center max-w-md">
                      Click "Add Material" to upload study materials, PDFs, or
                      documents for your course.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studyMaterials.map((mat, index) => (
                      <div
                        key={index}
                        className="group relative p-6 border-2 border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                      >
                        <div className="absolute top-4 right-4">
                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                            title="Remove Material"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="pr-12">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                📝 Material Title *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Chapter 1 Notes"
                                value={mat.title}
                                onChange={(e) =>
                                  updateMaterial(index, "title", e.target.value)
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                💬 Description
                              </label>
                              <input
                                type="text"
                                placeholder="Brief description"
                                value={mat.description}
                                onChange={(e) =>
                                  updateMaterial(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                              📎 Upload File (PDF, DOC, DOCX)
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                    <Plus
                                      size={20}
                                      className="text-slate-600 group-hover:text-blue-600"
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">
                                    Choose File to Upload
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) =>
                                    updateMaterial(
                                      index,
                                      "file",
                                      e.target.files[0],
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {mat.filePreview && (
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                {typeof mat.filePreview === "string" &&
                                mat.filePreview.startsWith("http") ? (
                                  <a
                                    href={mat.filePreview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-blue-600 hover:text-blue-700 group"
                                  >
                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                      <ExternalLink
                                        size={18}
                                        className="text-blue-600"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs font-medium text-slate-500 mb-1">
                                        File URL:
                                      </div>
                                      <div className="text-sm font-bold group-hover:underline break-all">
                                        {mat.filePreview}
                                      </div>
                                      <div className="text-xs text-blue-500 mt-1">
                                        Click to open in new tab
                                      </div>
                                    </div>
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                      <span className="text-lg">✅</span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-slate-700">
                                        File Selected
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {mat.filePreview}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- FOOTER --- */}
          <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--color-brand-blue)" }}
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading
                ? "Saving..."
                : course
                  ? "Update Course"
                  : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add some utility classes to index.css or App.css for cleaner JSX
// .input-field { @apply w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[var(--color-brand-blue)] outline-none transition-all shadow-sm; }
// .btn-add { @apply flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all; }
// .btn-delete { @apply absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors; }

export default CourseModal;
