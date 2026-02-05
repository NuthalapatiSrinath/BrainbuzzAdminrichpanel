import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Loader2,
  Layers,
  ChevronRight,
  FolderTree,
  Video,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  DollarSign,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Components
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import CourseModal from "../../components/modals/CourseModal";
import DataTable from "../../components/DataTable";

// Actions
import {
  fetchCourses,
  fetchCourseById,
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from "../../store/slices/courseSlice";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/categorySlice";
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../store/slices/subCategorySlice";

// ✅ CRITICAL: Content Type for this Module
const COURSE_CONTENT_TYPE = "ONLINE_COURSE";

const CourseManager = () => {
  const dispatch = useDispatch();

  // Active Tab State
  const [activeTab, setActiveTab] = useState("courses");

  // --- REDUX DATA ---
  const { courses, loading: courseLoading } = useSelector(
    (state) => state.courses,
  );

  // Local state for full course data with isActive field
  const [fullCourses, setFullCourses] = useState([]);
  const [isLoadingFullData, setIsLoadingFullData] = useState(false);
  const { categories, loading: catLoading } = useSelector(
    (state) => state.category,
  );
  const { subCategories, loading: subLoading } = useSelector(
    (state) => state.subCategory,
  );

  // --- LOCAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'course', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  // --- 🔥 FETCH DATA WITH API LOGGING ---
  useEffect(() => {
    console.group("🎓 COURSE MANAGER - API Verification");
    console.log("📘 Fetching Course-related APIs:");

    console.log("  ✅ [1/3] GET /admin/courses - Fetching all courses");
    dispatch(fetchCourses({ contentType: COURSE_CONTENT_TYPE }))
      .then((result) => {
        console.log("     ✓ Courses API completed");
        if (result.payload?.data?.[0]) {
          const sampleCourse = result.payload.data[0];
          console.log(
            "     📊 Sample Course Fields:",
            Object.keys(sampleCourse),
          );

          // Check for critical fields
          const criticalFields = [
            "isActive",
            "categories",
            "classes",
            "tutors",
            "studyMaterials",
          ];
          const missingFields = criticalFields.filter(
            (f) => !(f in sampleCourse),
          );

          if (missingFields.length > 0) {
            console.warn(`     ⚠️ Backend getCourses returns SIMPLIFIED data`);
            console.warn(`     Missing fields: ${missingFields.join(", ")}`);
            console.warn(
              `     💡 To fix: Backend needs to return FULL course objects for admin`,
            );
            console.warn(
              `     📍 Location: backend/src/controllers/Admin/courseController.js lines 944-962`,
            );
          }
        }
      })
      .catch((err) => console.error("     ✗ Courses API failed:", err));

    console.log(
      "  ✅ [2/3] GET /admin/categories - Fetching categories for ONLINE_COURSE",
    );
    dispatch(fetchCategories({ contentType: COURSE_CONTENT_TYPE }))
      .then(() => console.log("     ✓ Categories API completed"))
      .catch((err) => console.error("     ✗ Categories API failed:", err));

    console.log(
      "  ✅ [3/3] GET /admin/subcategories - Fetching subcategories for ONLINE_COURSE",
    );
    dispatch(fetchSubCategories({ contentType: COURSE_CONTENT_TYPE }))
      .then(() => console.log("     ✓ SubCategories API completed"))
      .catch((err) => console.error("     ✗ SubCategories API failed:", err));

    console.groupEnd();
  }, [dispatch]);

  // --- 🔥 FETCH FULL COURSE DATA (including isActive field) ---
  useEffect(() => {
    const fetchFullCourseData = async () => {
      if (!courses || courses.length === 0) {
        setFullCourses([]);
        return;
      }

      // Check if courses have isActive field
      const firstCourse = courses[0];
      if (typeof firstCourse.isActive !== "undefined") {
        console.log("✅ Courses already have isActive field - using as is");
        setFullCourses(courses);
        return;
      }

      console.group("🔄 Fetching Full Course Details");
      console.log(
        "⚠️ Courses missing isActive field - fetching full data for each course",
      );
      console.log(`📊 Fetching details for ${courses.length} courses...`);

      setIsLoadingFullData(true);

      try {
        const fullDataPromises = courses.map(async (course) => {
          try {
            console.log(`  → Fetching: ${course.name} (ID: ${course._id})`);
            const result = await dispatch(fetchCourseById(course._id)).unwrap();
            const fullCourse = result.data || result;
            console.log(
              `  ✓ Got full data for: ${course.name} - isActive: ${fullCourse.isActive}`,
            );
            return fullCourse;
          } catch (error) {
            console.error(`  ✗ Failed to fetch: ${course.name}`, error);
            return course; // Fallback to simplified data
          }
        });

        const fullData = await Promise.all(fullDataPromises);
        setFullCourses(fullData);

        console.log("✅ All course details fetched successfully");
        console.log(`📊 Status breakdown:`, {
          active: fullData.filter((c) => c.isActive).length,
          inactive: fullData.filter((c) => !c.isActive).length,
          unknown: fullData.filter((c) => typeof c.isActive === "undefined")
            .length,
        });
        console.groupEnd();
      } catch (error) {
        console.error("❌ Error fetching full course data:", error);
        console.groupEnd();
        setFullCourses(courses); // Fallback to simplified data
      } finally {
        setIsLoadingFullData(false);
      }
    };

    fetchFullCourseData();
  }, [courses, dispatch]);

  // --- HELPERS ---
  const toggleExpand = (catId) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const groupedSubCategories = useMemo(() => {
    const grouped = {};
    subCategories.forEach((sub) => {
      const catId = sub.category?._id || sub.category;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(sub);
    });
    return grouped;
  }, [subCategories]);

  // --- STATISTICS ---
  const statistics = useMemo(() => {
    const coursesToUse = fullCourses.length > 0 ? fullCourses : courses || [];
    if (coursesToUse.length === 0)
      return {
        totalCourses: 0,
        activeCourses: 0,
        totalClasses: 0,
        totalRevenue: 0,
      };

    return {
      totalCourses: coursesToUse.length,
      activeCourses: coursesToUse.filter((c) => c.isActive).length,
      totalClasses: coursesToUse.reduce(
        (sum, c) => sum + (c.classes?.length || 0),
        0,
      ),
      totalRevenue: coursesToUse
        .filter((c) => c.accessType === "PAID")
        .reduce((sum, c) => sum + (c.discountPrice || c.originalPrice || 0), 0),
    };
  }, [courses]);

  // --- ENHANCED FILTERING (Search in courses, classes, and classifications) ---
  const filteredCourses = useMemo(() => {
    // Use fullCourses which has isActive field
    const coursesToFilter = fullCourses.length > 0 ? fullCourses : courses;
    if (!search) return coursesToFilter;
    const s = search.toLowerCase();
    return coursesToFilter.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s) ||
        c.shortDescription?.toLowerCase().includes(s) ||
        c.detailedDescription?.toLowerCase().includes(s) ||
        c.categories?.some((cat) => cat.name?.toLowerCase().includes(s)) ||
        c.subCategories?.some((sub) => sub.name?.toLowerCase().includes(s)) ||
        c.classes?.some(
          (cls) =>
            cls.title?.toLowerCase().includes(s) ||
            cls.topic?.toLowerCase().includes(s),
        ) ||
        c.tutors?.some(
          (tutor) =>
            tutor.name?.toLowerCase().includes(s) ||
            tutor.subject?.toLowerCase().includes(s),
        ),
    );
  }, [fullCourses, courses, search]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const s = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s),
    );
  }, [categories, search]);

  const filteredSubCategories = useMemo(() => {
    if (!search) return groupedSubCategories;
    const s = search.toLowerCase();
    const filtered = {};
    Object.keys(groupedSubCategories).forEach((catId) => {
      const matchingSubs = groupedSubCategories[catId].filter(
        (sub) =>
          sub.name?.toLowerCase().includes(s) ||
          sub.description?.toLowerCase().includes(s),
      );
      if (matchingSubs.length > 0) {
        filtered[catId] = matchingSubs;
      }
    });
    return filtered;
  }, [groupedSubCategories, search]);

  // --- HANDLERS ---
  const openCreateModal = (type, parentId = null) => {
    setModalType(type);
    setSelectedItem(null);
    if (parentId) setTargetParentId(parentId);
    setIsModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = async (data) => {
    console.group(`➕ Creating ${modalType}`);

    try {
      if (modalType === "course") {
        // CourseModal handles its own submission
        console.log("📝 Course creation handled by CourseModal");
        toast.success("Course created successfully");
      } else if (modalType === "category") {
        const payload = { ...data, contentType: COURSE_CONTENT_TYPE };
        console.log("🔵 API Call: POST /admin/categories");
        console.log("📤 Payload:", payload);
        const result = await dispatch(createCategory(payload)).unwrap();
        console.log("✅ Response:", result);
        toast.success("Category created successfully");
      } else if (modalType === "subcategory") {
        const payload = targetParentId
          ? { ...data, category: targetParentId }
          : data;
        console.log("🔵 API Call: POST /admin/subcategories");
        console.log("📤 Payload:", payload);
        const result = await dispatch(createSubCategory(payload)).unwrap();
        console.log("✅ Response:", result);
        toast.success("SubCategory created successfully");
      }
      setIsModalOpen(false);
      console.groupEnd();
    } catch (err) {
      console.error("❌ Error:", err);
      console.groupEnd();
      toast.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  const handleUpdate = async (data) => {
    console.group(`✏️ Updating ${modalType}`);
    const id = selectedItem._id;
    console.log("📦 Update Data:", { id, type: modalType });

    try {
      if (modalType === "course") {
        // CourseModal handles its own submission
        console.log("📝 Course update handled by CourseModal");
        toast.success("Course updated successfully");
      } else if (modalType === "category") {
        console.log("🟡 API Call: PUT /admin/categories/:id");
        console.log("📤 Payload:", { id, formData: data });
        const result = await dispatch(
          updateCategory({ id, formData: data }),
        ).unwrap();
        console.log("✅ Response:", result);
        toast.success("Category updated successfully");
      } else if (modalType === "subcategory") {
        console.log("🟡 API Call: PUT /admin/subcategories/:id");
        console.log("📤 Payload:", { id, formData: data });
        const result = await dispatch(
          updateSubCategory({ id, formData: data }),
        ).unwrap();
        console.log("✅ Response:", result);
        toast.success("SubCategory updated successfully");
      }
      setIsModalOpen(false);
      setSelectedItem(null);
      console.groupEnd();
    } catch (err) {
      console.error("❌ Error:", err);
      console.groupEnd();
      toast.error("Update failed: " + (err.message || err));
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    console.group(`🗑️ Deleting ${type}`);
    console.log("📦 Delete Data:", { type, id });

    try {
      if (type === "course") {
        console.log("🔴 API Call: DELETE /admin/courses/:id");
        console.log("📤 Payload:", { id });
        const result = await dispatch(deleteCourse(id)).unwrap();
        console.log("✅ Response:", result);
      } else if (type === "category") {
        console.log("🔴 API Call: DELETE /admin/categories/:id");
        console.log("📤 Payload:", { id });
        const result = await dispatch(deleteCategory(id)).unwrap();
        console.log("✅ Response:", result);
      } else if (type === "subcategory") {
        console.log("🔴 API Call: DELETE /admin/subcategories/:id");
        console.log("📤 Payload:", { id });
        const result = await dispatch(deleteSubCategory(id)).unwrap();
        console.log("✅ Response:", result);
      }
      toast.success("Deleted successfully");
      console.groupEnd();
    } catch (err) {
      console.error("❌ Error:", err);
      console.groupEnd();
      toast.error("Delete failed: " + (err.message || err));
    }
  };

  const handleToggleActive = async (course) => {
    console.group(`🔄 Toggle Status Request - ${course.name}`);
    console.log("📦 Course ID:", course._id);
    console.log("📦 Current Data:", {
      hasIsActiveField: typeof course.isActive !== "undefined",
      isActive: course.isActive,
      name: course.name,
    });

    if (!course || !course._id) {
      console.error("❌ Invalid course data - missing ID");
      console.groupEnd();
      toast.error("Invalid course data");
      return;
    }

    // Check if isActive field exists (backend may return simplified data)
    if (typeof course.isActive === "undefined") {
      console.error("❌ Course missing isActive field");
      console.warn("⚠️ This means backend returned simplified data");
      console.warn(
        "💡 Solution: Wait for full course data to load or fix backend",
      );
      console.groupEnd();
      toast.error(
        "Cannot toggle status: Course data still loading. Please wait...",
        { duration: 3000 },
      );
      return;
    }

    console.group(`🔄 Toggling Course Status - ${course.name}`);
    console.log("📦 Course Data:", {
      id: course._id,
      name: course.name,
      currentStatus: course.isActive ? "ACTIVE" : "INACTIVE",
      targetStatus: course.isActive ? "INACTIVE" : "ACTIVE",
    });

    const loadingToast = toast.loading(
      course.isActive ? "Unpublishing course..." : "Publishing course...",
    );

    try {
      let result;
      if (course.isActive) {
        console.log("🔴 API Call: PATCH /admin/courses/:id/unpublish");
        console.log("📤 Payload:", { courseId: course._id });
        result = await dispatch(unpublishCourse(course._id)).unwrap();
        console.log("✅ Response:", result);
        toast.success("Course unpublished successfully", { id: loadingToast });
      } else {
        console.log("🟢 API Call: PATCH /admin/courses/:id/publish");
        console.log("📤 Payload:", { courseId: course._id });
        result = await dispatch(publishCourse(course._id)).unwrap();
        console.log("✅ Response:", result);
        toast.success("Course published successfully", { id: loadingToast });
      }

      console.log("✅ Course status updated in Redux store");
      console.log("📊 Updated course data:", result);

      // Refresh the courses list to ensure UI is in sync
      console.log("🔄 Refreshing course list...");
      await dispatch(fetchCourses({ contentType: COURSE_CONTENT_TYPE }));
      console.log("✅ Course list refreshed");
      console.groupEnd();
    } catch (error) {
      console.error("❌ Error:", error);
      console.groupEnd();

      const errorMessage =
        error?.message ||
        error?.error ||
        error ||
        "Failed to update course status";

      toast.error(
        `Failed to ${course.isActive ? "unpublish" : "publish"} course: ${errorMessage}`,
        { id: loadingToast },
      );
    }
  };

  // --- MODAL CONFIG ---
  const getModalConfig = () => {
    if (modalType === "category") {
      return [
        {
          name: "name",
          label: "Category Name",
          type: "text",
          required: true,
          placeholder: "e.g. UPSC Preparation",
        },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "thumbnail",
          label: "Thumbnail",
          type: "file",
          accept: "image/*",
          previewKey: "thumbnailUrl",
        },
      ];
    }
    if (modalType === "subcategory") {
      const fields = [
        {
          name: "name",
          label: "SubCategory Name",
          type: "text",
          required: true,
          placeholder: "e.g. IAS Mains",
        },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "thumbnail",
          label: "Thumbnail",
          type: "file",
          accept: "image/*",
          previewKey: "thumbnailUrl",
        },
      ];
      if (!targetParentId && !selectedItem) {
        const options = categories.map((c) => ({
          label: c.name,
          value: c._id,
        }));
        fields.unshift({
          name: "category",
          label: "Parent Category",
          type: "select",
          options,
          required: true,
        });
      }
      return fields;
    }
    return [];
  };

  // --- COURSE TABLE COLUMNS ---
  const courseColumns = [
    {
      header: "Course",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnail ? (
            <img
              src={row.thumbnail}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border-2 border-blue-100 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center border-2 border-blue-100">
              <BookOpen
                className="w-7 h-7"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500 line-clamp-1">
              {row.description || "No description"}
            </p>
            <div className="flex gap-2 mt-1">
              {row.languages && row.languages[0] && (
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {row.languages[0].name}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Content",
      accessor: "classes",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Video className="w-3 h-3" /> {row.classes?.length || 0} Classes
          </div>
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <FileText className="w-3 h-3" /> {row.studyMaterials?.length || 0}{" "}
            Materials
          </div>
          <div className="flex items-center gap-2 text-violet-600 font-bold">
            <Users className="w-3 h-3" /> {row.tutors?.length || 0} Tutors
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "categories",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.categories?.slice(0, 2).map((c, i) => (
            <span
              key={i}
              className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded"
            >
              {c.name || c}
            </span>
          ))}
          {row.categories?.length > 2 && (
            <span className="text-xs font-bold text-slate-400">
              +{row.categories.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "originalPrice",
      render: (row) => (
        <div>
          {row.accessType === "FREE" ? (
            <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">
              🎁 FREE
            </span>
          ) : (
            <div className="space-y-1">
              <p
                className="text-lg font-black"
                style={{ color: "var(--color-primary)" }}
              >
                ₹
                {(row.discountPrice || row.originalPrice || 0).toLocaleString()}
              </p>
              {row.originalPrice > row.discountPrice && (
                <p className="text-xs text-slate-400 line-through">
                  ₹{row.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => {
        // Handle case where isActive is undefined (backend returns simplified data)
        const hasStatusData = typeof row.isActive !== "undefined";

        if (!hasStatusData) {
          return (
            <div
              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
              style={{
                backgroundColor: "var(--color-warning-bg)",
                color: "var(--color-warning-text)",
              }}
              title="Loading full course data..."
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading...
            </div>
          );
        }

        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleActive(row);
            }}
            disabled={courseLoading || isLoadingFullData}
            title={`Click to ${row.isActive ? "unpublish" : "publish"} this course`}
            style={{
              backgroundColor: row.isActive
                ? "var(--color-brand-green-light)"
                : "var(--color-danger-bg)",
              color: row.isActive
                ? "var(--color-brand-green)"
                : "var(--color-danger-text)",
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:shadow-lg"
          >
            {courseLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {row.isActive ? "Active" : "Inactive"}
              </span>
            ) : (
              <span>{row.isActive ? "✓ Active" : "✗ Inactive"}</span>
            )}
          </button>
        );
      },
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openEditModal("course", row)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("course", row._id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 🎓 HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 shadow-lg"
        style={{ background: "var(--color-brand-blue)" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              Course Manager
              <span className="px-3 py-1 bg-white/20 text-sm rounded-full border border-white/30">
                {statistics.totalCourses} Courses
              </span>
            </h1>
            <p className="text-white/90 text-base flex items-center gap-2 mt-1">
              <TrendingUp size={14} /> Manage online courses & classifications
            </p>
          </div>
        </div>
      </motion.div>

      {/* 📊 STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={statistics.totalCourses}
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Active Courses"
          value={statistics.activeCourses}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Classes"
          value={statistics.totalClasses}
          icon={Video}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${statistics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* 🎯 TAB HEADER & SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto w-full xl:w-auto">
          {["courses", "classifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              style={
                activeTab === tab ? { color: "var(--color-brand-blue)" } : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full xl:w-auto justify-end px-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search..."
          />
          <button
            onClick={() =>
              openCreateModal(activeTab === "courses" ? "course" : "category")
            }
            className="px-4 py-2 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
            style={{ background: "var(--color-brand-blue)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--color-brand-blue-dark)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-brand-blue)")
            }
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      {/* 📑 CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* TAB 1: COURSES */}
        {activeTab === "courses" && (
          <DataTable
            title=""
            columns={courseColumns}
            data={filteredCourses}
            loading={courseLoading}
            hideSearch={true}
          />
        )}

        {/* TAB 2: CLASSIFICATIONS (Categories & Subcategories) */}
        {activeTab === "classifications" && (
          <div className="p-4 space-y-4">
            {catLoading || subLoading ? (
              <div className="flex justify-center items-center h-64 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-600 mb-2">
                  No Categories Found
                </h3>
                <p className="text-slate-500 mb-4">
                  Create your first category to organize courses
                </p>
                <button
                  onClick={() => openCreateModal("category")}
                  className="px-6 py-3 text-white rounded-xl font-bold transition-all"
                  style={{ background: "var(--color-brand-blue)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-brand-blue-dark)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-brand-blue)")
                  }
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create Category
                </button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(category._id)}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedCategories[category._id] ? "rotate-90" : ""
                        }`}
                      />
                      {category.thumbnailUrl ? (
                        <img
                          src={category.thumbnailUrl}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          alt=""
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {(search
                            ? filteredSubCategories[category._id]?.length
                            : groupedSubCategories[category._id]?.length) ||
                            0}{" "}
                          Subcategories
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateModal("subcategory", category._id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                        style={{
                          color: "var(--color-brand-blue)",
                          background: "var(--color-primary-light)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--color-brand-blue-lighter)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--color-primary-light)")
                        }
                      >
                        <Plus className="w-3 h-3" /> Add Sub
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal("category", category);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("category", category._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[category._id] && (
                    <div className="border-t border-slate-200 bg-white">
                      {(search
                        ? filteredSubCategories[category._id]
                        : groupedSubCategories[category._id]
                      )?.length > 0 ? (
                        <div className="grid grid-cols-1 divide-y divide-slate-100">
                          {(search
                            ? filteredSubCategories[category._id]
                            : groupedSubCategories[category._id]
                          ).map((sub) => (
                            <div
                              key={sub._id}
                              className="flex items-center justify-between p-3 pl-14 hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3">
                                {sub.thumbnailUrl ? (
                                  <img
                                    src={sub.thumbnailUrl}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                    alt=""
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <FolderTree className="w-4 h-4" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-slate-700">
                                  {sub.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openEditModal("subcategory", sub)
                                  }
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("subcategory", sub._id)
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-sm italic">
                          No subcategories found. Add one above.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🎭 MODALS */}
      {modalType === "course" ? (
        <CourseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          course={selectedItem}
          onSuccess={() => {
            dispatch(fetchCourses({ contentType: COURSE_CONTENT_TYPE }));
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
        />
      ) : (
        <GenericModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
            setTargetParentId(null);
          }}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
          title={`${selectedItem ? "Edit" : "Add"} ${modalType}`}
          fields={getModalConfig()}
        />
      )}
    </div>
  );
};

// 🎨 STAT CARD COMPONENT
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "var(--color-primary)",
    green: "var(--color-success)",
    purple: "var(--color-purple)",
    amber: "var(--color-amber)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-3 rounded-xl shadow-md"
          style={{ background: colorMap[color] }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-600 mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </motion.div>
  );
};

export default CourseManager;
