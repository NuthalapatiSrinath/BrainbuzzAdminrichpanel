import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Layers,
  Settings,
  FileText,
  Loader2,
  Sparkles,
  Trophy,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

// Services
import testSeriesService from "../../../api/testSeriesService";
import categoryService from "../../../api/categoryService";
import subCategoryService from "../../../api/subCategoryService";
import languageService from "../../../api/languageService";

// Components
import CustomDropdown from "../../../components/common/CustomDropdown";

const TEST_SERIES_CONTENT_TYPE = "TEST_SERIES";

const SeriesDashboard = () => {
  const { id } = useParams(); // If present, we are editing
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("settings"); // 'settings' | 'content'

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Data
  const [formData, setFormData] = useState({
    name: "",
    noOfTests: 0,
    description: "",
    originalPrice: 0,
    isActive: true,
    accessType: "PAID",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
  });
  const [tests, setTests] = useState([]); // List of tests in this series

  useEffect(() => {
    loadDropdowns();
    if (id) {
      loadSeriesData(id);
    }
  }, [id]);

  const loadDropdowns = async () => {
    try {
      const [cat, lang] = await Promise.all([
        categoryService.getAll(TEST_SERIES_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);
      setCategories(cat.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(lang.data.map((l) => ({ label: l.name, value: l._id })));
    } catch (e) {
      console.error(e);
    }
  };

  // Dependent Subcategory Load
  useEffect(() => {
    if (!formData.categoryIds?.[0]) {
      setSubCategories([]);
      return;
    }
    subCategoryService
      .getAll(TEST_SERIES_CONTENT_TYPE, formData.categoryIds[0])
      .then((res) =>
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        ),
      );
  }, [formData.categoryIds]);

  const loadSeriesData = async (seriesId) => {
    setLoading(true);
    try {
      const res = await testSeriesService.getFullById(seriesId);
      const data = res.data;
      setFormData({
        name: data.name,
        noOfTests: data.noOfTests,
        description: data.description,
        originalPrice: data.originalPrice,
        isActive: data.isActive,
        accessType: data.accessType,
        categoryIds: data.categories.map((c) => c._id),
        subCategoryIds: data.subCategories.map((s) => s._id),
        languageIds: data.languages.map((l) => l._id),
      });
      setTests(data.tests || []);
    } catch (e) {
      toast.error("Failed to load series");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeries = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "languageIds") {
          // Backend expects 'language' not 'languageIds'
          payload.append("language", JSON.stringify(formData[key]));
        } else if (key === "categoryIds" || key === "subCategoryIds") {
          // Backend expects these exact field names
          payload.append(key, JSON.stringify(formData[key]));
        } else {
          payload.append(key, formData[key]);
        }
      });

      if (id) {
        await testSeriesService.update(id, payload);
        toast.success("Series Updated");
      } else {
        const res = await testSeriesService.create(payload);
        toast.success("Series Created");
        navigate(`/test-series/${res.data._id}`); // Redirect to edit mode
      }
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // Test Actions
  const handleAddTest = async () => {
    const name = prompt("Enter Test Name:");
    if (!name) return;
    try {
      await testSeriesService.addTest(id, {
        testName: name,
        noOfQuestions: 10,
        totalMarks: 100,
        positiveMarks: 1,
        negativeMarks: 0,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
      });
      toast.success("Test Added");
      loadSeriesData(id); // Reload to get new test
    } catch (e) {
      toast.error("Failed to add test");
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm("Delete this test?")) return;
    try {
      await testSeriesService.deleteTest(id, testId);
      loadSeriesData(id);
      toast.success("Test Deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (loading && !formData.name)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate("/test-series")}
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/30 text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-bold text-white flex items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-8 h-8" />
                  </motion.div>
                  {id
                    ? formData.name || "Series Dashboard"
                    : "✨ Create New Series"}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-indigo-100 mt-1"
                >
                  {id
                    ? "📚 Manage series settings and content"
                    : "🚀 Enter basic details to start"}
                </motion.p>
              </div>
            </div>
            {id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex bg-white/20 backdrop-blur-md p-1.5 rounded-xl border border-white/30 shadow-lg"
              >
                <motion.button
                  onClick={() => setActiveTab("settings")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "settings" ? "bg-white text-indigo-600 shadow-lg" : "text-white hover:bg-white/20"}`}
                >
                  <Settings className="w-4 h-4" /> ⚙️ Settings
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("content")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "content" ? "bg-white text-indigo-600 shadow-lg" : "text-white hover:bg-white/20"}`}
                >
                  <Trophy className="w-4 h-4" /> 📚 Tests
                  <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs">
                    {tests.length}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* SETTINGS TAB */}
        {(activeTab === "settings" || !id) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // 🔥 FIXED: Added dark mode classes for container
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-indigo-100 dark:border-indigo-900/50 p-8"
          >
            <form onSubmit={handleSaveSeries} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-200 dark:border-indigo-800">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      📝 Basic Info
                    </h3>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      📚 Series Name
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-900/50 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter series name"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      📄 Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all resize-none"
                      rows="4"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe this test series..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        🏆 No. Tests
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-900/50 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all"
                        value={formData.noOfTests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            noOfTests: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        💰 Price (₹)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-900/50 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originalPrice: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-200 dark:border-purple-800">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      🗂️ Classification & Status
                    </h3>
                  </div>
                  <CustomDropdown
                    label="Category"
                    options={categories}
                    value={formData.categoryIds[0]}
                    onChange={(v) =>
                      setFormData({ ...formData, categoryIds: [v] })
                    }
                    icon={Layers}
                  />
                  <CustomDropdown
                    label="SubCategory"
                    options={subCategories}
                    value={formData.subCategoryIds[0]}
                    onChange={(v) =>
                      setFormData({ ...formData, subCategoryIds: [v] })
                    }
                    icon={Layers}
                    disabled={!formData.categoryIds.length}
                  />
                  <CustomDropdown
                    label="Language"
                    options={languages}
                    value={formData.languageIds[0]}
                    onChange={(v) =>
                      setFormData({ ...formData, languageIds: [v] })
                    }
                    icon={FileText}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-green-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          ✅ Active / Published
                        </span>
                      </div>
                    </label>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6 border-t-2 border-indigo-100 dark:border-indigo-900/50 flex justify-end"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-2xl hover:shadow-indigo-300 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {id ? "💾 Update Series" : "✨ Create Series"}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        )}

        {/* CONTENT TAB (TESTS LIST) */}
        {activeTab === "content" && id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>

              <div className="relative flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-8 h-8 animate-pulse" />
                    <h2 className="text-2xl font-bold">📚 Manage Tests</h2>
                  </div>
                  <p className="text-indigo-100">
                    Add, edit, and organize tests within this series.
                  </p>
                </div>
                <motion.button
                  onClick={handleAddTest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> ✨ Add Test
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {tests.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 text-slate-400 font-medium bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-700"
                  >
                    <Trophy className="w-16 h-16 text-slate-200 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-lg font-bold">No tests created yet</p>
                    <p className="text-sm mt-2">
                      Click "Add Test" to get started
                    </p>
                  </motion.div>
                )}

                {tests.map((test, i) => (
                  <motion.div
                    key={test._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900/50 p-6 rounded-2xl border-2 border-indigo-100 dark:border-gray-700 shadow-md hover:shadow-xl transition-all flex justify-between items-center group"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-l-2xl"></div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shadow-lg text-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">
                          {test.testName}
                        </h3>
                        <div className="flex gap-2 text-xs font-medium">
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {test.noOfQuestions || 0} Qs
                          </span>
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {test.totalMarks || 0} Marks
                          </span>
                          <span
                            className={`${test.isFree ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"} px-3 py-1 rounded-lg flex items-center gap-1`}
                          >
                            <Tag className="w-3 h-3" />
                            {test.isFree ? "Free" : "Paid"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        onClick={() =>
                          navigate(`/test-series/${id}/tests/${test._id}`)
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm rounded-xl hover:shadow-lg flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> ✏️ Design
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteTest(test._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SeriesDashboard;
