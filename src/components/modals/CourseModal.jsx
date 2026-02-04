import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Video,
  FileText,
  User,
  Image,
} from "lucide-react";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSubCategories } from "../../store/slices/subCategorySlice";
import { fetchLanguages } from "../../store/slices/languageSlice";
import { fetchValidities } from "../../store/slices/validitySlice";
import { createCourse, updateCourse } from "../../store/slices/courseSlice";

const CourseModal = ({ isOpen, onClose, course = null, onSuccess }) => {
  const dispatch = useDispatch();
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

  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

  // Load dependencies
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories({ contentType: "ONLINE_COURSE" }));
      dispatch(fetchSubCategories({ contentType: "ONLINE_COURSE" }));
      dispatch(fetchLanguages());
      dispatch(fetchValidities());
    }
  }, [isOpen, dispatch]);

  // Populate form when editing
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
        course.studyMaterials?.map((m) => ({
          ...m,
          filePreview: m.fileUrl,
        })) || [],
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

  // Tutors
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
      const file = value;
      updated[index].photo = file;
      updated[index].photoPreview = URL.createObjectURL(file);
    } else {
      updated[index][field] = value;
    }
    setTutors(updated);
  };

  const removeTutor = (index) => {
    setTutors(tutors.filter((_, i) => i !== index));
  };

  // Classes
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
        videoPreview: null,
        thumbnailPreview: null,
        lecturePhotoPreview: null,
      },
    ]);
  };

  const updateClass = (index, field, value) => {
    const updated = [...classes];
    if (
      field === "video" ||
      field === "thumbnail" ||
      field === "lecturePhoto"
    ) {
      const file = value;
      updated[index][field] = file;
      updated[index][`${field}Preview`] = URL.createObjectURL(file);
    } else {
      updated[index][field] = value;
    }
    setClasses(updated);
  };

  const removeClass = (index) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  // Study Materials
  const addMaterial = () => {
    setStudyMaterials([
      ...studyMaterials,
      { title: "", description: "", file: null, filePreview: null },
    ]);
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...studyMaterials];
    if (field === "file") {
      const file = value;
      updated[index].file = file;
      updated[index].filePreview = file.name;
    } else {
      updated[index][field] = value;
    }
    setStudyMaterials(updated);
  };

  const removeMaterial = (index) => {
    setStudyMaterials(studyMaterials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      alert("Course name is required");
      return;
    }
    if (!formData.originalPrice) {
      alert("Original price is required");
      return;
    }
    if (!formData.categoryId) {
      alert("Category is required");
      return;
    }

    // Calculate discount percentage
    let discountPercent = 0;
    if (
      formData.originalPrice &&
      formData.discountPrice &&
      formData.discountPrice < formData.originalPrice
    ) {
      discountPercent = Math.round(
        ((parseFloat(formData.originalPrice) -
          parseFloat(formData.discountPrice)) /
          parseFloat(formData.originalPrice)) *
          100,
      );
    }

    const courseData = {
      name: formData.name,
      courseType: formData.courseType,
      startDate: formData.startDate,
      categoryIds: formData.categoryId ? [formData.categoryId] : [],
      subCategoryIds: formData.subCategoryId ? [formData.subCategoryId] : [],
      languageIds: formData.languageIds,
      validityIds: formData.validityIds,
      originalPrice: formData.originalPrice,
      discountPrice: formData.discountPrice,
      discountPercent: discountPercent, // Add calculated discount percentage
      accessType: formData.accessType,
      pricingNote: formData.pricingNote,
      shortDescription: formData.shortDescription,
      detailedDescription: formData.detailedDescription,
      isActive: formData.isActive,
      thumbnail: formData.thumbnail,
      tutors,
      classes,
      studyMaterials,
    };

    try {
      if (course) {
        await dispatch(updateCourse({ id: course._id, courseData })).unwrap();
      } else {
        await dispatch(createCourse(courseData)).unwrap();
      }
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to save course:", error);
      alert(`Failed to save course: ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-7xl max-h-[95vh] min-h-[700px] overflow-hidden flex flex-col shadow-2xl border-2 border-transparent bg-gradient-to-br from-white via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 ring-4 ring-indigo-100/50 dark:ring-indigo-900/30">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 border-b-4 border-indigo-400 dark:border-indigo-800 p-3 flex justify-between items-center z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Video className="text-white" size={22} />
            </div>
            <h2 className="text-2xl font-black text-white drop-shadow-lg">
              {course ? "✏️ Edit Online Course" : "✨ Create Online Course"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:rotate-90 hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-indigo-200 dark:border-indigo-800 sticky top-[60px] bg-gradient-to-r from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-indigo-950/20 dark:to-gray-900 z-10 shadow-sm">
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
              className={`flex-1 px-6 py-3 font-bold capitalize transition-all duration-300 relative group ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105"
                  : "text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              }`}
            >
              <span className="text-xl mr-2">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
                      📝 Course Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                      required
                      placeholder="Enter course name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🎯 Course Type
                    </label>
                    <input
                      type="text"
                      name="courseType"
                      value={formData.courseType}
                      onChange={handleInputChange}
                      placeholder="e.g., Beginner, Advanced"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      📅 Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      💰 Access Type *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="relative cursor-pointer group">
                        <input
                          type="radio"
                          name="accessType"
                          value="FREE"
                          checked={formData.accessType === "FREE"}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="flex items-center gap-3 p-4 border-2 rounded-xl transition-all duration-300 peer-checked:border-green-500 peer-checked:bg-gradient-to-r peer-checked:from-green-50 peer-checked:to-emerald-100 dark:peer-checked:from-green-900/30 dark:peer-checked:to-emerald-900/30 peer-checked:shadow-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-400 hover:shadow-md">
                          <div className="text-2xl">🎁</div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              Free Course
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              No payment required
                            </div>
                          </div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group">
                        <input
                          type="radio"
                          name="accessType"
                          value="PAID"
                          checked={formData.accessType === "PAID"}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="flex items-center gap-3 p-4 border-2 rounded-xl transition-all duration-300 peer-checked:border-purple-500 peer-checked:bg-gradient-to-r peer-checked:from-purple-50 peer-checked:to-pink-100 dark:peer-checked:from-purple-900/30 dark:peer-checked:to-pink-900/30 peer-checked:shadow-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 hover:shadow-md">
                          <div className="text-2xl">💎</div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              Paid Course
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Premium content
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      💵 Original Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md"
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🎫 Discount Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-green-600 dark:text-green-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-green-300 dark:border-green-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900/50 transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Auto-calculated Discount Percentage Display */}
                  {formData.originalPrice > 0 &&
                    formData.discountPrice > 0 &&
                    formData.discountPrice < formData.originalPrice && (
                      <div className="md:col-span-2">
                        <div className="p-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-xl border-4 border-green-300 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                          <div className="relative text-center">
                            <div className="text-sm font-bold text-white/90 mb-2">
                              💰 DISCOUNT SAVINGS
                            </div>
                            <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                              {Math.round(
                                ((parseFloat(formData.originalPrice) -
                                  parseFloat(formData.discountPrice)) /
                                  parseFloat(formData.originalPrice)) *
                                  100,
                              )}
                              % OFF
                            </div>
                            <div className="text-xl font-bold text-white/95">
                              Save ₹
                              {(
                                parseFloat(formData.originalPrice) -
                                parseFloat(formData.discountPrice)
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
                      📂 Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300 font-medium shadow-sm hover:shadow-md cursor-pointer"
                      required
                    >
                      <option value="">Select Category</option>
                      {(categories || []).map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      📋 Sub Category
                    </label>
                    <select
                      value={formData.subCategoryId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategoryId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all duration-300 font-medium shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <option value="">Select Sub Category (Optional)</option>
                      {(subCategories || []).map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🌍 Languages
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl dark:bg-gray-800/50 max-h-40 overflow-y-auto backdrop-blur-sm">
                      {(languages || []).map((lang) => (
                        <label key={lang._id} className="group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.languageIds.includes(lang._id)}
                            onChange={() =>
                              handleMultiSelect("languageIds", lang._id)
                            }
                            className="peer sr-only"
                          />
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full transition-all duration-300 peer-checked:from-blue-500 peer-checked:to-indigo-500 peer-checked:text-white peer-checked:shadow-lg peer-checked:scale-105 border-2 border-transparent peer-checked:border-white/30 hover:shadow-md">
                            <span className="text-sm font-bold dark:text-white peer-checked:text-white">
                              {lang.name}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      ⏰ Validities
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl dark:bg-gray-800/50 max-h-40 overflow-y-auto backdrop-blur-sm">
                      {(validities || []).map((val) => (
                        <label key={val._id} className="group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.validityIds.includes(val._id)}
                            onChange={() =>
                              handleMultiSelect("validityIds", val._id)
                            }
                            className="peer sr-only"
                          />
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full transition-all duration-300 peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:text-white peer-checked:shadow-lg peer-checked:scale-105 border-2 border-transparent peer-checked:border-white/30 hover:shadow-md">
                            <span className="text-sm font-bold dark:text-white peer-checked:text-white">
                              {val.label || `${val.durationInDays} days`}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🖼️ Thumbnail
                    </label>
                    <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                      {formData.thumbnailPreview && (
                        <div className="relative group">
                          <img
                            src={formData.thumbnailPreview}
                            alt="Thumbnail"
                            className="w-40 h-40 object-cover rounded-xl shadow-lg border-4 border-white dark:border-gray-800 ring-2 ring-indigo-200 dark:ring-indigo-800 transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <Image className="text-white" size={32} />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-indigo-500 file:to-purple-500 file:text-white hover:file:from-indigo-600 hover:file:to-purple-600 file:shadow-lg file:transition-all file:duration-300 cursor-pointer"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      📝 Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all duration-300 resize-none shadow-sm hover:shadow-md"
                      placeholder="Brief course overview..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      📖 Detailed Description
                    </label>
                    <textarea
                      name="detailedDescription"
                      value={formData.detailedDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/50 transition-all duration-300 resize-none shadow-sm hover:shadow-md"
                      placeholder="Complete course details and learning outcomes..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🏷️ Pricing Note
                    </label>
                    <input
                      type="text"
                      name="pricingNote"
                      value={formData.pricingNote}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-900/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="e.g., Limited time offer, Early bird discount"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-md transition-all duration-300">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ✅ Active Status
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Course will be visible to users
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tutors Tab */}
            {activeTab === "tutors" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addTutor}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400"
                >
                  <Plus size={20} className="animate-pulse" />
                  👨‍🏫 Add Tutor
                </button>

                {tutors.map((tutor, index) => (
                  <div
                    key={index}
                    className="p-6 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl dark:bg-gray-800/50 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-gray-800 dark:via-indigo-950/20 dark:to-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        👨‍🏫 Tutor #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTutor(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Remove Tutor"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="👤 Name"
                        value={tutor.name}
                        onChange={(e) =>
                          updateTutor(index, "name", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all duration-300 font-medium shadow-sm"
                      />
                      <input
                        type="text"
                        placeholder="📚 Subject"
                        value={tutor.subject}
                        onChange={(e) =>
                          updateTutor(index, "subject", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/50 transition-all duration-300 font-medium shadow-sm"
                      />
                      <input
                        type="text"
                        placeholder="🎓 Qualification"
                        value={tutor.qualification}
                        onChange={(e) =>
                          updateTutor(index, "qualification", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300 font-medium shadow-sm md:col-span-2"
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          🖼️ Photo
                        </label>
                        <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                          {tutor.photoPreview && (
                            <img
                              src={tutor.photoPreview}
                              alt="Tutor"
                              className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white dark:border-gray-800"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateTutor(index, "photo", e.target.files[0])
                            }
                            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 file:shadow-md cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Classes Tab */}
            {activeTab === "classes" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addClass}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-400"
                >
                  <Plus size={20} className="animate-pulse" />
                  🎓 Add Class
                </button>

                {classes.map((cls, index) => (
                  <div
                    key={index}
                    className="p-6 border-2 border-blue-200 dark:border-blue-800 rounded-2xl dark:bg-gray-800/50 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-950/20 dark:to-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        🎓 Class #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeClass(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Remove Class"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={cls.title}
                        onChange={(e) =>
                          updateClass(index, "title", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Topic"
                        value={cls.topic}
                        onChange={(e) =>
                          updateClass(index, "topic", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Order"
                        value={cls.order}
                        onChange={(e) =>
                          updateClass(index, "order", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <label className="flex items-center gap-2 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={cls.isFree}
                          onChange={(e) =>
                            updateClass(index, "isFree", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm dark:text-white">Is Free</span>
                      </label>

                      <div className="md:col-span-2">
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Video
                        </label>
                        <div className="flex items-center gap-3">
                          {cls.videoPreview && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Video selected
                            </span>
                          )}
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) =>
                              updateClass(index, "video", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Thumbnail
                        </label>
                        <div className="flex items-center gap-3">
                          {cls.thumbnailPreview && (
                            <img
                              src={cls.thumbnailPreview}
                              alt="Thumbnail"
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateClass(index, "thumbnail", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Lecture Photo
                        </label>
                        <div className="flex items-center gap-3">
                          {cls.lecturePhotoPreview && (
                            <img
                              src={cls.lecturePhotoPreview}
                              alt="Lecture"
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
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
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Study Materials Tab */}
            {activeTab === "materials" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addMaterial}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-400"
                >
                  <Plus size={20} className="animate-pulse" />
                  📚 Add Material
                </button>

                {studyMaterials.map((material, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-md dark:border-gray-600 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold dark:text-white">
                        Material {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={material.title}
                        onChange={(e) =>
                          updateMaterial(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <textarea
                        placeholder="Description"
                        value={material.description}
                        onChange={(e) =>
                          updateMaterial(index, "description", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div>
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          File (PDF, DOC, etc.)
                        </label>
                        <div className="flex items-center gap-3">
                          {material.filePreview && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {material.filePreview}
                            </span>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={(e) =>
                              updateMaterial(index, "file", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t-2 border-indigo-200 dark:border-indigo-800 p-3 flex justify-end gap-4 mt-auto shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 font-bold shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-black shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-indigo-400"
            >
              {loading
                ? "⏳ Saving..."
                : course
                  ? "✏️ Update Course"
                  : "✨ Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
