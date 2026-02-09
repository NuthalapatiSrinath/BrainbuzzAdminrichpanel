import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Upload,
  Layers,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  Video,
  List,
  Trophy,
  ArrowLeft,
  MoreHorizontal,
  PlayCircle,
  HelpCircle,
  Sparkles,
  Tag,
  Globe,
  Percent,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";

// Services
import testSeriesService from "../../api/testSeriesService";
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";
import validityService from "../../api/validityService";

const TEST_SERIES_CONTENT_TYPE = "TEST_SERIES";

const TestSeriesModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("series"); // 'series' | 'test_editor'

  // --- DROPDOWN DATA ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [validities, setValidities] = useState([]);

  // --- SERIES DATA ---
  const [seriesData, setSeriesData] = useState({
    name: "",
    noOfTests: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    isActive: true,
    originalPrice: 0,
    discountType: "",
    discountValue: 0,
    discountValidUntil: "",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    validityId: "",
    accessType: "PAID",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fullSeriesData, setFullSeriesData] = useState(null); // Contains Tests & Deep Data

  // --- TEST EDITOR STATE (For Drill Down) ---
  const [currentTest, setCurrentTest] = useState(null); // The test being edited
  const [testTab, setTestTab] = useState("details"); // details, instructions, video, sections, cutoff, results

  // --- INIT ---
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        populateSeriesForm(initialData);
        fetchFullDetails(initialData._id);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const fetchFullDetails = async (id) => {
    try {
      const res = await testSeriesService.getFullById(id);
      setFullSeriesData(res.data);
      // If we were editing a test, refresh its data in memory
      if (currentTest) {
        const updatedTest = res.data.tests.find(
          (t) => t._id === currentTest._id,
        );
        if (updatedTest) setCurrentTest(updatedTest);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [cat, lang, val] = await Promise.all([
        categoryService.getAll(TEST_SERIES_CONTENT_TYPE, true),
        languageService.getAll(),
        validityService.getAll(),
      ]);
      setCategories(cat.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(lang.data.map((l) => ({ label: l.name, value: l._id })));
      setValidities(val.data.map((v) => ({ label: v.label, value: v._id })));
    } catch (e) {
      console.error(e);
    }
  };

  // Dependent SubCategory
  useEffect(() => {
    const loadSub = async () => {
      if (!seriesData.categoryIds?.length) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await subCategoryService.getAll(
          TEST_SERIES_CONTENT_TYPE,
          seriesData.categoryIds[0],
        );
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadSub();
  }, [seriesData.categoryIds]);

  const populateSeriesForm = (data) => {
    setSeriesData({
      name: data.name || "",
      noOfTests: data.noOfTests || 0,
      description: data.description || "",
      date: data.date ? data.date.split("T")[0] : "",
      isActive: data.isActive ?? true,
      originalPrice: data.originalPrice || 0,
      discountType: data.discount?.type || "",
      discountValue: data.discount?.value || 0,
      discountValidUntil: data.discount?.validUntil
        ? data.discount.validUntil.split("T")[0]
        : "",
      categoryIds: data.categories?.map((c) => c._id || c) || [],
      subCategoryIds: data.subCategories?.map((s) => s._id || s) || [],
      languageIds: data.languages?.map((l) => l._id || l) || [],
      validityId: data.validity?._id || data.validity || "",
      accessType: data.accessType || "PAID",
    });
    setPreview(data.thumbnail);
    setThumbnail(null);
  };

  const resetForm = () => {
    setSeriesData({
      name: "",
      noOfTests: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      isActive: true,
      originalPrice: 0,
      discountType: "",
      discountValue: 0,
      discountValidUntil: "",
      categoryIds: [],
      subCategoryIds: [],
      languageIds: [],
      validityId: "",
      accessType: "PAID",
    });
    setThumbnail(null);
    setPreview(null);
    setActiveTab("basic");
    setFullSeriesData(null);
    setViewMode("series");
    setCurrentTest(null);
  };

  // --- SERIES HANDLERS ---
  const handleSeriesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeriesData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSelect = (field, val) =>
    setSeriesData((prev) => ({
      ...prev,
      [field]: field === "validityId" ? val : Array.isArray(val) ? val : [val],
    }));
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSeriesSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(seriesData).forEach((key) => {
      if (key.includes("Ids") || key === "validityId")
        data.append(
          key.replace("Ids", "").replace("Id", ""),
          JSON.stringify(seriesData[key]),
        );
      else data.append(key, seriesData[key]);
    });
    if (thumbnail) data.append("thumbnail", thumbnail);

    try {
      if (initialData) {
        await onSubmit({ _isEdit: true, id: initialData._id, data });
        fetchFullDetails(initialData._id);
      } else {
        await onSubmit(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TEST MANIPULATION HANDLERS ---
  const handleAddTest = async () => {
    const name = prompt("Enter Test Name:");
    if (!name) return;
    try {
      await testSeriesService.addTest(initialData._id, {
        testName: name,
        noOfQuestions: 10,
        totalMarks: 10,
        positiveMarks: 1,
        negativeMarks: 0,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
      });
      toast.success("Test Added");
      fetchFullDetails(initialData._id);
    } catch (e) {
      toast.error("Failed to add test");
    }
  };

  const openTestEditor = (test) => {
    setCurrentTest(test);
    setViewMode("test_editor");
    setTestTab("details");
  };

  // --- TEST SUB-COMPONENTS (Rendered inside the modal) ---
  const renderTestEditor = () => {
    if (!currentTest) return null;

    // Helper to update local test state while editing fields
    const updateLocalTest = (field, value) =>
      setCurrentTest((prev) => ({ ...prev, [field]: value }));

    const saveTestDetails = async () => {
      try {
        await testSeriesService.updateTest(
          initialData._id,
          currentTest._id,
          currentTest,
        );
        toast.success("Test details saved");
        fetchFullDetails(initialData._id);
      } catch (e) {
        toast.error("Failed to save");
      }
    };

    const saveInstructions = async () => {
      try {
        await testSeriesService.updateInstructions(
          initialData._id,
          currentTest._id,
          {
            instructionsPage1: currentTest.instructionsPage1,
            instructionsPage2: currentTest.instructionsPage2,
            instructionsPage3: currentTest.instructionsPage3,
          },
        );
        toast.success("Instructions updated");
      } catch (e) {
        toast.error("Failed");
      }
    };

    const handleVideoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("explanationVideo", file);
      try {
        const loadingToast = toast.loading("Uploading Video...");
        await testSeriesService.updateExplanationVideo(
          initialData._id,
          currentTest._id,
          formData,
        );
        toast.dismiss(loadingToast);
        toast.success("Video uploaded!");
        fetchFullDetails(initialData._id);
      } catch (e) {
        toast.error("Upload failed");
      }
    };

    const saveCutoff = async () => {
      // Assuming cutoff data is stored in a temporary state or inside currentTest object if populated
      // For this UI, let's assume we prompt or use simple inputs mapped to a state
      // Simplified for brevity - ideally use separate state for cutoff
      const general = prompt(
        "General Cutoff:",
        currentTest.cutoff?.general || 0,
      );
      if (general === null) return;
      try {
        await testSeriesService.setCutoff(initialData._id, currentTest._id, {
          general,
          obc: general,
          sc: general,
          st: general,
        }); // Simplification
        toast.success("Cutoff Updated");
      } catch (e) {
        toast.error("Failed");
      }
    };

    return (
      <div className="space-y-6">
        {/* Test Editor Header */}
        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("series")}
              className="p-1 hover:bg-white rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-700" />
            </button>
            <h3 className="font-bold text-indigo-900">
              Editing: {currentTest.testName}
            </h3>
          </div>
          <button onClick={saveTestDetails} className="btn-primary text-xs">
            <Save className="w-3 h-3 mr-1" /> Save Details
          </button>
        </div>

        {/* Test Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          {[
            "details",
            "instructions",
            "video",
            "sections",
            "cutoff",
            "results",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setTestTab(t)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-t-lg transition-all ${testTab === t ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* --- TEST EDITOR CONTENT --- */}
        <div className="p-1">
          {testTab === "details" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Test Name</label>
                <input
                  className="input"
                  value={currentTest.testName}
                  onChange={(e) => updateLocalTest("testName", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Total Marks</label>
                <input
                  type="number"
                  className="input"
                  value={currentTest.totalMarks}
                  onChange={(e) =>
                    updateLocalTest("totalMarks", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Positive Marks</label>
                <input
                  type="number"
                  className="input"
                  value={currentTest.positiveMarks}
                  onChange={(e) =>
                    updateLocalTest("positiveMarks", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Negative Marks</label>
                <input
                  type="number"
                  className="input"
                  value={currentTest.negativeMarks}
                  onChange={(e) =>
                    updateLocalTest("negativeMarks", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={currentTest.date ? currentTest.date.split("T")[0] : ""}
                  onChange={(e) => updateLocalTest("date", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Publish Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={
                    currentTest.resultPublishTime
                      ? new Date(currentTest.resultPublishTime)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    updateLocalTest("resultPublishTime", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {testTab === "instructions" && (
            <div className="space-y-4">
              {[
                "instructionsPage1",
                "instructionsPage2",
                "instructionsPage3",
              ].map((page, i) => (
                <div key={page}>
                  <label className="label">Instruction Page {i + 1}</label>
                  <textarea
                    rows="3"
                    className="input"
                    value={currentTest[page] || ""}
                    onChange={(e) => updateLocalTest(page, e.target.value)}
                    placeholder={`HTML or Text for Page ${i + 1}`}
                  />
                </div>
              ))}
              <button
                onClick={saveInstructions}
                className="btn-primary w-full mt-2"
              >
                Save Instructions
              </button>
            </div>
          )}

          {testTab === "video" && (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
              <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">
                {currentTest.totalExplanationVideoUrl
                  ? "Video Uploaded ✅"
                  : "No Video Uploaded"}
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          )}

          {testTab === "sections" && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h4 className="font-bold">Sections</h4>
                <button
                  className="text-xs text-indigo-600 font-bold"
                  onClick={async () => {
                    const title = prompt("Section Title");
                    if (title) {
                      await testSeriesService.addSection(
                        initialData._id,
                        currentTest._id,
                        { title, order: 1, noOfQuestions: 10 },
                      );
                      fetchFullDetails(initialData._id);
                    }
                  }}
                >
                  + Add Section
                </button>
              </div>
              {currentTest.sections?.map((section) => (
                <div
                  key={section._id}
                  className="border p-3 rounded-lg bg-slate-50"
                >
                  <div className="flex justify-between font-bold text-sm">
                    <span>
                      {section.title} ({section.questions.length} Qs)
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600"
                        onClick={async () => {
                          // Add Question Logic (Simplified)
                          await testSeriesService.addQuestion(
                            initialData._id,
                            currentTest._id,
                            section._id,
                            {
                              questionNumber: section.questions.length + 1,
                              questionText: "New Question",
                              options: ["A", "B", "C", "D"],
                              correctOptionIndex: 0,
                            },
                          );
                          fetchFullDetails(initialData._id);
                        }}
                      >
                        + Q
                      </button>
                      <button
                        className="text-red-600"
                        onClick={async () => {
                          if (confirm("Delete Section?")) {
                            await testSeriesService.deleteSection(
                              initialData._id,
                              currentTest._id,
                              section._id,
                            );
                            fetchFullDetails(initialData._id);
                          }
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                  {/* Question List Preview */}
                  <div className="mt-2 pl-2 border-l-2 border-slate-200">
                    {section.questions.map((q) => (
                      <div
                        key={q._id}
                        className="text-xs text-slate-500 py-1 border-b border-slate-100 flex justify-between"
                      >
                        <span className="truncate w-3/4">
                          {q.questionNumber}. {q.questionText}
                        </span>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={async () => {
                            await testSeriesService.deleteQuestion(
                              initialData._id,
                              currentTest._id,
                              section._id,
                              q._id,
                            );
                            fetchFullDetails(initialData._id);
                          }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {testTab === "cutoff" && (
            <div className="text-center p-10">
              <button onClick={saveCutoff} className="btn-primary">
                Manage Cutoffs
              </button>
            </div>
          )}

          {testTab === "results" && (
            <div className="text-center p-10 text-slate-500 italic">
              Use the "Participants" button on the main dashboard to view
              detailed rankings.
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col border-2 border-purple-200 dark:border-purple-800"
      >
        {/* Rich Gradient Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-5 shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
              >
                {viewMode === "series" ? (
                  <Layers className="w-6 h-6 text-white" />
                ) : (
                  <FileText className="w-6 h-6 text-white" />
                )}
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-white drop-shadow-lg">
                  {viewMode === "series"
                    ? initialData
                      ? "✏️ Edit Test Series"
                      : "✨ New Test Series"
                    : "📝 Test Manager"}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {viewMode === "series"
                    ? "Configure series details and tests"
                    : "Manage test content and settings"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20">
          {/* VIEW 1: SERIES FORM */}
          {viewMode === "series" && (
            <>
              {/* Rich Tabs */}
              <div className="flex gap-2 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-2 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                {[
                  { key: "basic", label: "📝 Basic Info", icon: FileText },
                  { key: "pricing", label: "💰 Pricing", icon: DollarSign },
                  { key: "classification", label: "🗂️ Classification", icon: Layers },
                  ...(initialData ? [{ key: "content", label: "📚 Content", icon: List }] : []),
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                        activeTab === tab.key
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-white/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </motion.button>
                  );
                })}
              </div>

              <form
                id="series-form"
                onSubmit={handleSeriesSubmit}
                className="space-y-6"
              >
                {activeTab === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          📝 Series Name
                        </label>
                        <input
                          name="name"
                          value={seriesData.name}
                          onChange={handleSeriesChange}
                          placeholder="Enter series name..."
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          <List className="w-4 h-4 text-indigo-600" />
                          📊 No. of Tests
                        </label>
                        <input
                          type="number"
                          name="noOfTests"
                          value={seriesData.noOfTests}
                          onChange={handleSeriesChange}
                          placeholder="0"
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          📅 Start Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={seriesData.date}
                          onChange={handleSeriesChange}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-medium"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl cursor-pointer hover:shadow-lg transition-all w-full">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={seriesData.isActive}
                            onChange={handleSeriesChange}
                            className="w-5 h-5 accent-green-600 rounded"
                          />
                          <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ✅ Active / Published
                          </span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        📄 Description
                      </label>
                      <textarea
                        name="description"
                        value={seriesData.description}
                        onChange={handleSeriesChange}
                        rows="4"
                        placeholder="Enter series description..."
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none font-medium resize-none"
                      />
                    </div>
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl">
                      <div className="flex gap-4 items-center">
                        {preview && (
                          <motion.img
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            src={preview}
                            className="w-24 h-24 rounded-xl object-cover border-2 border-purple-300 shadow-lg"
                          />
                        )}
                        <div className="flex-1">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                            🖼️ Thumbnail Image
                          </label>
                          <input
                            type="file"
                            onChange={handleFile}
                            accept="image/*"
                            className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-bold hover:file:bg-purple-700 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "pricing" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          💰 Price (₹)
                        </label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={seriesData.originalPrice}
                          onChange={handleSeriesChange}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 text-sm font-medium transition-all disabled:bg-slate-100 dark:bg-slate-800 dark:border-green-700 dark:focus:border-green-400"
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          🏷️ Access Type
                        </label>
                        <select
                          name="accessType"
                          value={seriesData.accessType}
                          onChange={handleSeriesChange}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-sm font-medium transition-all disabled:bg-slate-100 dark:bg-slate-800 dark:border-purple-700 dark:focus:border-purple-400"
                        >
                          <option value="PAID">Paid</option>
                          <option value="FREE">Free</option>
                        </select>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 border-2 border-amber-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl" />
                      <h4 className="flex items-center gap-2 text-lg font-bold text-amber-900 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                        🎁 Discount Settings
                      </h4>
                      <div className="grid grid-cols-3 gap-4 relative">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <Percent className="w-4 h-4 text-amber-600" />
                            Type
                          </label>
                          <select
                            name="discountType"
                            value={seriesData.discountType}
                            onChange={handleSeriesChange}
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 text-sm font-medium transition-all bg-white"
                          >
                            <option value="">None</option>
                            <option value="percentage">Percentage %</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <DollarSign className="w-4 h-4 text-amber-600" />
                            Value
                          </label>
                          <input
                            type="number"
                            name="discountValue"
                            value={seriesData.discountValue}
                            onChange={handleSeriesChange}
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 text-sm font-medium transition-all disabled:bg-slate-100 disabled:opacity-50 bg-white"
                            disabled={!seriesData.discountType}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            Valid Until
                          </label>
                          <input
                            type="date"
                            name="discountValidUntil"
                            value={seriesData.discountValidUntil}
                            onChange={handleSeriesChange}
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 text-sm font-medium transition-all disabled:bg-slate-100 disabled:opacity-50 bg-white"
                            disabled={!seriesData.discountType}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                {activeTab === "classification" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200"
                  >
                    <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl" />
                    
                    <div className="relative grid grid-cols-2 gap-6">
                      <CustomDropdown
                        label="Category"
                        options={categories}
                        value={seriesData.categoryIds?.[0]}
                        onChange={(v) => handleSelect("categoryIds", v)}
                        placeholder="Select"
                        required
                        icon={Layers}
                      />
                      <CustomDropdown
                        label="Sub Category"
                        options={subCategories}
                        value={seriesData.subCategoryIds?.[0]}
                        onChange={(v) => handleSelect("subCategoryIds", v)}
                        placeholder="Select"
                        disabled={!seriesData.categoryIds.length}
                        icon={Layers}
                      />
                      <CustomDropdown
                        label="Language"
                        options={languages}
                        value={seriesData.languageIds?.[0]}
                        onChange={(v) => handleSelect("languageIds", v)}
                        placeholder="Select"
                        required
                        icon={FileText}
                      />
                      <CustomDropdown
                        label="Validity"
                        options={validities}
                        value={seriesData.validityId}
                        onChange={(v) => handleSelect("validityId", v)}
                        placeholder="Select"
                        icon={Clock}
                      />
                    </div>
                  </motion.div>
                )}
                {activeTab === "content" && fullSeriesData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative overflow-hidden flex justify-between items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 rounded-2xl shadow-lg">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                      <div className="relative flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-white animate-pulse" />
                        <h4 className="font-bold text-xl text-white">📚 All Tests</h4>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white">
                          {fullSeriesData.tests.length} Tests
                        </span>
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleAddTest}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Test
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <AnimatePresence>
                        {fullSeriesData.tests.map((test, i) => (
                          <motion.div
                            key={test._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => openTestEditor(test)}
                            className="relative overflow-hidden border-2 border-indigo-100 p-5 rounded-2xl hover:shadow-xl cursor-pointer bg-gradient-to-br from-white to-indigo-50 flex justify-between items-center group transition-all hover:border-indigo-300"
                          >
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>
                            <div className="pl-3">
                              <div className="font-bold text-lg text-slate-800 mb-1 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg text-indigo-600 text-sm font-bold">
                                  {i + 1}
                                </span>
                                {test.testName}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-600">
                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  {test.noOfQuestions} Questions
                                </span>
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                                  <Trophy className="w-3.5 h-3.5" />
                                  {test.totalMarks} Marks
                                </span>
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                                  test.isFree 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  <Tag className="w-3.5 h-3.5" />
                                  {test.isFree ? "Free" : "Paid"}
                                </span>
                              </div>
                            </div>
                            <motion.div
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-500" />
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </form>
            </>
          )}

          {/* VIEW 2: TEST EDITOR */}
          {viewMode === "test_editor" && renderTestEditor()}
        </div>

        {/* Footer */}
        {viewMode === "series" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-5 border-t-2 border-indigo-100 bg-gradient-to-r from-slate-50 via-indigo-50 to-purple-50 flex justify-end gap-4 shrink-0"
          >
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
            >
              ❌ Cancel
            </motion.button>
            {activeTab !== "content" && (
              <motion.button
                type="submit"
                form="series-form"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "💾 Save Series"}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>,
    document.body
  );
};

// --- CSS UTILS ---
const label = "block text-xs font-bold text-slate-500 uppercase mb-1";
const input =
  "w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-medium transition-all disabled:bg-slate-100";

export default TestSeriesModal;
