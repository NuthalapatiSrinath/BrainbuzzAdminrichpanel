import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Loader2,
  Layers,
  FolderTree,
  ChevronRight,
  Search,
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import TestSeriesModal from "../../components/modals/TestSeriesModal"; // The mega modal
import {
  fetchTestSeries,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
} from "../../store/slices/testSeriesSlice";
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

const TEST_SERIES_CONTENT_TYPE = "TEST_SERIES";

const TestSeriesManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("series");

  // Redux
  const { items: seriesList, loading } = useSelector(
    (state) => state.testSeries,
  );
  const { categories } = useSelector((state) => state.category);
  const { subCategories } = useSelector((state) => state.subCategory);

  // Local
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'series', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  useEffect(() => {
    dispatch(fetchTestSeries({}));
    dispatch(fetchCategories({ contentType: TEST_SERIES_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: TEST_SERIES_CONTENT_TYPE }));
  }, [dispatch]);

  // Actions
  const openModal = (type, parentId = null, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (parentId) setTargetParentId(parentId);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setTargetParentId(null);
  };

  const handleCreate = async (data) => {
    try {
      if (modalType === "series")
        await dispatch(createTestSeries(data)).unwrap();
      else if (modalType === "category")
        await dispatch(
          createCategory({ ...data, contentType: TEST_SERIES_CONTENT_TYPE }),
        ).unwrap();
      else if (modalType === "subcategory")
        await dispatch(
          createSubCategory(
            targetParentId ? { ...data, category: targetParentId } : data,
          ),
        ).unwrap();
      toast.success("Created!");
      closeModal();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = selectedItem._id;
      if (modalType === "series" && data._isEdit)
        await dispatch(
          updateTestSeries({ id: data.id, data: data.data }),
        ).unwrap();
      else if (modalType === "category")
        await dispatch(updateCategory({ id, formData: data })).unwrap();
      else if (modalType === "subcategory")
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
      toast.success("Updated!");
      closeModal();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Delete?")) return;
    try {
      if (type === "series") await dispatch(deleteTestSeries(id)).unwrap();
      else if (type === "category") await dispatch(deleteCategory(id)).unwrap();
      else if (type === "subcategory")
        await dispatch(deleteSubCategory(id)).unwrap();
      toast.success("Deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  // Helpers
  const toggleExpand = (id) =>
    setExpandedCategories((p) => ({ ...p, [id]: !p[id] }));
  const groupedSubCategories = useMemo(() => {
    const g = {};
    subCategories.forEach((s) => {
      const pid = s.category?._id || s.category;
      if (!g[pid]) g[pid] = [];
      g[pid].push(s);
    });
    return g;
  }, [subCategories]);

  // Filters
  const filteredSeries = useMemo(
    () =>
      seriesList.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [seriesList, search],
  );
  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  // Calculate stats
  const stats = useMemo(() => {
    const activeSeries = seriesList.filter((s) => s.isActive).length;
    const totalTests = seriesList.reduce(
      (sum, s) => sum + (s.noOfTests || 0),
      0,
    );
    const totalRevenue = seriesList.reduce(
      (sum, s) => sum + (s.originalPrice || 0),
      0,
    );
    return {
      totalSeries: seriesList.length,
      activeSeries,
      totalTests,
      totalRevenue,
      totalCategories: categories.length,
      totalSubCategories: subCategories.length,
    };
  }, [seriesList, categories, subCategories]);

  const columns = [
    {
      header: "Series Name",
      accessor: "name",
      render: (r) => (
        <div className="flex gap-3 items-center">
          {r.thumbnail && (
            <img src={r.thumbnail} className="w-10 h-10 rounded object-cover" />
          )}
          <span className="font-bold text-slate-800">{r.name}</span>
        </div>
      ),
    },
    {
      header: "Tests",
      accessor: "noOfTests",
      render: (r) => (
        <span className="badge bg-slate-100">{r.noOfTests} Tests</span>
      ),
    },
    {
      header: "Price",
      accessor: "originalPrice",
      render: (r) => (
        <span className="font-bold text-green-600">₹{r.originalPrice}</span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (r) => (
        <span
          className={`badge ${r.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {r.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openModal("series", null, r)}
            className="btn-icon text-indigo-600 hover:bg-indigo-50"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("series", r._id)}
            className="btn-icon text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 p-6 space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
            >
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg flex items-center gap-3">
                📝 Test Series Manager
                <span className="text-lg font-normal bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {seriesList.length} Series
                </span>
              </h1>
              <p className="text-white/90 text-lg mt-2">
                Manage test series, categories, and subcategories
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              openModal(activeTab === "series" ? "series" : "category")
            }
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          {
            label: "Total Series",
            value: stats.totalSeries,
            icon: FileText,
            gradient: "from-purple-500 to-indigo-500",
            bgGradient: "from-purple-50 to-indigo-50",
            darkBg: "from-purple-950/30 to-indigo-950/30",
          },
          {
            label: "Active Series",
            value: stats.activeSeries,
            icon: Sparkles,
            gradient: "from-green-500 to-emerald-500",
            bgGradient: "from-green-50 to-emerald-50",
            darkBg: "from-green-950/30 to-emerald-950/30",
          },
          {
            label: "Total Tests",
            value: stats.totalTests,
            icon: BookOpen,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50",
            darkBg: "from-blue-950/30 to-cyan-950/30",
          },
          {
            label: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            gradient: "from-orange-500 to-red-500",
            bgGradient: "from-orange-50 to-red-50",
            darkBg: "from-orange-950/30 to-red-950/30",
          },
          {
            label: "Categories",
            value: stats.totalCategories,
            icon: Layers,
            gradient: "from-pink-500 to-rose-500",
            bgGradient: "from-pink-50 to-rose-50",
            darkBg: "from-pink-950/30 to-rose-950/30",
          },
          {
            label: "Subcategories",
            value: stats.totalSubCategories,
            icon: FolderTree,
            gradient: "from-violet-500 to-purple-500",
            bgGradient: "from-violet-50 to-purple-50",
            darkBg: "from-violet-950/30 to-purple-950/30",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} dark:${stat.darkBg} rounded-2xl p-5 border-2 border-white dark:border-gray-800 shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 dark:bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div
                  className={`inline-flex p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tab Selection & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-1.5 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            {["series", "classification"].map((t) => (
              <motion.button
                key={t}
                onClick={() => setActiveTab(t)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                  activeTab === t
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-purple-600"
                }`}
              >
                {t === "series" ? "📚 Test Series" : "🗂️ Classifications"}
              </motion.button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search test series..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none font-medium"
            />
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[500px]"
      >
        {activeTab === "series" ? (
          loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 text-purple-600" />
              </motion.div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Loading test series...
              </p>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <div className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl">
                <FileText className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                No test series found
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Create your first test series to get started
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSeries.map((series, index) => (
                  <motion.div
                    key={series._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/5 group-hover:to-indigo-500/5 transition-all duration-300" />

                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-900 dark:to-indigo-900">
                      {series.thumbnail ? (
                        <img
                          src={series.thumbnail}
                          alt={series.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-20 h-20 text-purple-400 dark:text-purple-600" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                            series.isActive
                              ? "bg-green-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          {series.isActive ? "✓ Active" : "✕ Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {series.name}
                        </h3>
                        {series.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {series.description}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            {series.noOfTests} Tests
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">
                            ₹{series.originalPrice}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openModal("series", null, series)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete("series", series._id)}
                          className="px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 font-bold rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="p-6">
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-96 gap-4">
                <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl">
                  <Layers className="w-16 h-16 text-indigo-600" />
                </div>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  No categories found
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Create categories to organize your test series
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((cat, index) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/20 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-2xl transition-all"
                  >
                    {/* Header */}
                    <div className="relative p-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Layers className="w-5 h-5" />
                          </div>
                          <span className="font-black text-lg">{cat.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("category", null, cat);
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete("category", cat._id);
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg backdrop-blur-sm transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => toggleExpand(cat._id)}
                        className="w-full flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        <motion.div
                          animate={{
                            rotate: expandedCategories[cat._id] ? 90 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                        {expandedCategories[cat._id] ? "Hide" : "Show"}{" "}
                        Subcategories
                        <span className="ml-auto px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                          {groupedSubCategories[cat._id]?.length || 0}
                        </span>
                      </motion.button>

                      <AnimatePresence>
                        {expandedCategories[cat._id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            {groupedSubCategories[cat._id]?.map(
                              (sub, subIndex) => (
                                <motion.div
                                  key={sub._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIndex * 0.05 }}
                                  className="group/sub flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                                >
                                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FolderTree className="w-4 h-4 text-indigo-500" />
                                    {sub.name}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        openModal("subcategory", null, sub)
                                      }
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        handleDelete("subcategory", sub._id)
                                      }
                                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                  </div>
                                </motion.div>
                              ),
                            )}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => openModal("subcategory", cat._id)}
                              className="w-full py-3 border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-all"
                            >
                              + Add Subcategory
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {modalType === "series" ? (
        <TestSeriesModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={modalType === "series" ? handleUpdate : handleCreate}
          initialData={selectedItem}
        />
      ) : (
        <GenericModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
          title={`${selectedItem ? "Edit" : "Add"} ${modalType}`}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "thumbnail",
              label: "Thumbnail",
              type: "file",
              previewKey: "thumbnailUrl",
            },
          ]}
        />
      )}
    </div>
  );
};

export default TestSeriesManager;
