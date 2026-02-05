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
  Users,
  CheckCircle,
  TrendingUp,
  DollarSign,
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
  const { categories, loading: catLoading } = useSelector(
    (state) => state.category,
  );
  const { subCategories, loading: subLoading } = useSelector(
    (state) => state.subCategory,
  );

  // Local state for full course data (merged with details)
  const [fullCourses, setFullCourses] = useState([]);
  const [isHydrating, setIsHydrating] = useState(false);

  // --- LOCAL UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'course', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    dispatch(fetchCourses({ contentType: COURSE_CONTENT_TYPE }));
    dispatch(fetchCategories({ contentType: COURSE_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: COURSE_CONTENT_TYPE }));
  }, [dispatch]);

  // --- 2. DATA HYDRATION (Fix for Backend missing fields in list API) ---
  useEffect(() => {
    if (!courses || courses.length === 0) {
      setFullCourses([]);
      return;
    }

    // Merge logic: If we already have a detailed object (with isActive), keep it.
    // If Redux sends a new simple object, we replace it UNLESS we are currently hydrating.
    setFullCourses((prevFull) => {
      return courses.map((reduxCourse) => {
        const existingDetail = prevFull.find((c) => c._id === reduxCourse._id);
        return existingDetail && typeof existingDetail.isActive !== "undefined"
          ? { ...existingDetail, ...reduxCourse }
          : reduxCourse;
      });
    });
  }, [courses]);

  // Fetch missing details (isActive) separately
  useEffect(() => {
    const fetchMissingDetails = async () => {
      const coursesNeedingData = fullCourses.filter(
        (c) => typeof c.isActive === "undefined",
      );

      if (coursesNeedingData.length > 0 && !isHydrating) {
        setIsHydrating(true);
        try {
          const updatedData = [...fullCourses];

          await Promise.all(
            coursesNeedingData.map(async (course) => {
              try {
                const result = await dispatch(
                  fetchCourseById(course._id),
                ).unwrap();
                const fullData = result.data || result;

                const index = updatedData.findIndex(
                  (c) => c._id === course._id,
                );
                if (index !== -1) updatedData[index] = fullData;
              } catch (err) {
                console.error(`Failed to hydrate ${course.name}`, err);
              }
            }),
          );
          setFullCourses(updatedData);
        } catch (error) {
          console.error("Hydration error", error);
        } finally {
          setIsHydrating(false);
        }
      }
    };

    if (fullCourses.length > 0) fetchMissingDetails();
  }, [fullCourses, dispatch, isHydrating]);

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
    const data = fullCourses.length > 0 ? fullCourses : courses || [];
    return {
      totalCourses: data.length,
      activeCourses: data.filter((c) => c.isActive).length,
      totalClasses: data.reduce((sum, c) => sum + (c.classes?.length || 0), 0),
      totalRevenue: data
        .filter((c) => c.accessType === "PAID")
        .reduce((sum, c) => sum + (c.discountPrice || c.originalPrice || 0), 0),
    };
  }, [fullCourses, courses]);

  // --- FILTERING ---
  const filteredCourses = useMemo(() => {
    const data = fullCourses.length > 0 ? fullCourses : courses;
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        c.categories?.some((cat) => cat.name?.toLowerCase().includes(s)),
    );
  }, [fullCourses, courses, search]);

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const s = search.toLowerCase();
    return categories.filter((c) => c.name?.toLowerCase().includes(s));
  }, [categories, search]);

  const filteredSubCategories = useMemo(() => {
    if (!search) return groupedSubCategories;
    const s = search.toLowerCase();
    const filtered = {};
    Object.keys(groupedSubCategories).forEach((catId) => {
      const matchingSubs = groupedSubCategories[catId].filter((sub) =>
        sub.name?.toLowerCase().includes(s),
      );
      if (matchingSubs.length > 0) filtered[catId] = matchingSubs;
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
    try {
      if (modalType === "course") {
        // Handled by CourseModal
      } else if (modalType === "category") {
        const payload = { ...data, contentType: COURSE_CONTENT_TYPE };
        await dispatch(createCategory(payload)).unwrap();
        toast.success("Category created");
      } else if (modalType === "subcategory") {
        const payload = {
          ...data,
          contentType: COURSE_CONTENT_TYPE,
          category: targetParentId || data.category,
        };
        await dispatch(createSubCategory(payload)).unwrap();
        toast.success("SubCategory created");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Operation failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = selectedItem._id;
      if (modalType === "course") {
        // Handled by CourseModal
      } else if (modalType === "category") {
        await dispatch(updateCategory({ id, formData: data })).unwrap();
        toast.success("Category updated");
      } else if (modalType === "subcategory") {
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
        toast.success("SubCategory updated");
      }
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      if (type === "course") {
        await dispatch(deleteCourse(id)).unwrap();
        setFullCourses((prev) => prev.filter((c) => c._id !== id));
      } else if (type === "category") {
        await dispatch(deleteCategory(id)).unwrap();
      } else if (type === "subcategory") {
        await dispatch(deleteSubCategory(id)).unwrap();
      }
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleToggleActive = async (course) => {
    if (typeof course.isActive === "undefined") {
      toast.error("Please wait for course details to load...");
      return;
    }

    const newStatus = !course.isActive;
    const action = newStatus ? publishCourse : unpublishCourse;
    const loadingToast = toast.loading(
      newStatus ? "Publishing..." : "Unpublishing...",
    );

    try {
      // Optimistic update
      setFullCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, isActive: newStatus } : c,
        ),
      );
      await dispatch(action(course._id)).unwrap();
      toast.success(`Course ${newStatus ? "published" : "unpublished"}`, {
        id: loadingToast,
      });
    } catch (error) {
      // Revert on failure
      setFullCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, isActive: !newStatus } : c,
        ),
      );
      toast.error("Status update failed", { id: loadingToast });
    }
  };

  // --- MODAL CONFIG ---
  const getModalConfig = () => {
    if (modalType === "category") {
      return [
        { name: "name", label: "Category Name", type: "text", required: true },
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
        fields.unshift({
          name: "category",
          label: "Parent Category",
          type: "select",
          options: categories.map((c) => ({ label: c.name, value: c._id })),
          required: true,
        });
      }
      return fields;
    }
    return [];
  };

  // --- COLUMNS ---
  const courseColumns = useMemo(
    () => [
      {
        header: "Course",
        accessor: "name",
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.thumbnail ? (
              <img
                src={row.thumbnail}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{row.name}</p>
              <div className="flex gap-2 mt-0.5">
                {row.languages?.map((l, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    {l.code || l.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Stats",
        render: (row) => (
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Video size={12} className="text-blue-500" />{" "}
              {row.classes?.length || 0} Classes
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-purple-500" />{" "}
              {row.tutors?.length || 0} Tutors
            </div>
          </div>
        ),
      },
      {
        header: "Price",
        accessor: "originalPrice",
        render: (row) => (
          <div>
            {row.accessType === "FREE" ? (
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                FREE
              </span>
            ) : (
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                  ₹
                  {(
                    row.discountPrice ||
                    row.originalPrice ||
                    0
                  ).toLocaleString()}
                </span>
                {row.originalPrice > row.discountPrice && (
                  <span className="text-[10px] text-slate-400 line-through">
                    ₹{row.originalPrice.toLocaleString()}
                  </span>
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
          if (typeof row.isActive === "undefined") {
            return (
              <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex items-center gap-1 w-fit">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading...
              </div>
            );
          }
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleActive(row);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                row.isActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {row.isActive ? "Active" : "Inactive"}
            </button>
          );
        },
      },
      {
        header: "Actions",
        className: "text-right",
        render: (row) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                if (typeof row.isActive === "undefined")
                  toast("Loading details...", { icon: "⏳" });
                else openEditModal("course", row);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete("course", row._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [fullCourses],
  );

  return (
    <div className="p-6 space-y-6">
      {/* 🎓 HERO HEADER - BRAINBUZZ THEME */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 shadow-lg"
        style={{ background: "var(--color-brand-blue)" }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              Course Manager
              <span className="px-3 py-1 bg-white/20 text-sm rounded-full border border-white/30 font-medium">
                {statistics.totalCourses} Courses
              </span>
            </h1>
            <p className="text-blue-100 text-base flex items-center gap-2 mt-1">
              <TrendingUp size={16} /> Manage online courses, tutors & content
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
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {["courses", "classifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white shadow-sm text-[var(--color-brand-blue)]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
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
            className="px-4 py-2 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            style={{ background: "var(--color-brand-blue)" }}
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>
      </div>

      {/* 📑 CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {activeTab === "courses" && (
          <DataTable
            title=""
            columns={courseColumns}
            data={filteredCourses}
            loading={courseLoading && fullCourses.length === 0}
            hideSearch={true}
          />
        )}

        {activeTab === "classifications" && (
          <div className="p-4 space-y-3">
            {catLoading || subLoading ? (
              <div className="flex justify-center items-center h-64 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderTree className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  No Categories Found
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Create a category to start organizing content.
                </p>
                <button
                  onClick={() => openCreateModal("category")}
                  className="px-5 py-2 text-white rounded-lg font-bold text-sm"
                  style={{ background: "var(--color-brand-blue)" }}
                >
                  Create Category
                </button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
                >
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white cursor-pointer group"
                    onClick={() => toggleExpand(category._id)}
                  >
                    <div className="flex items-center gap-4">
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedCategories[category._id]
                            ? "rotate-90 text-blue-500"
                            : ""
                        }`}
                      />
                      {category.thumbnailUrl ? (
                        <img
                          src={category.thumbnailUrl}
                          className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                          alt=""
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
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
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateModal("subcategory", category._id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Sub
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal("category", category);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("category", category._id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[category._id] && (
                    <div className="border-t border-slate-100 bg-white">
                      {(search
                        ? filteredSubCategories[category._id]
                        : groupedSubCategories[category._id]
                      )?.length > 0 ? (
                        <div className="grid grid-cols-1 divide-y divide-slate-50">
                          {(search
                            ? filteredSubCategories[category._id]
                            : groupedSubCategories[category._id]
                          ).map((sub) => (
                            <div
                              key={sub._id}
                              className="flex items-center justify-between p-3 pl-16 hover:bg-slate-50 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                  {sub.thumbnailUrl ? (
                                    <img
                                      src={sub.thumbnailUrl}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <FolderTree className="w-4 h-4" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                  {sub.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <button
                                  onClick={() =>
                                    openEditModal("subcategory", sub)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("subcategory", sub._id)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs italic">
                          No subcategories found.
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
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-2xl font-black text-slate-800 mt-2">{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl shadow-sm ${colorMap[color]} text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default CourseManager;
