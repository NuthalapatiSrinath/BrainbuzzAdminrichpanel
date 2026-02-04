import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Video,
  FileText,
  Layout,
  Scissors,
  HelpCircle,
  GripVertical,
  Sparkles,
  Trophy,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import testSeriesService from "../../../api/testSeriesService";

const TestDesigner = () => {
  const { seriesId, testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sections"); // details, instructions, sections, video, cutoff
  const [testData, setTestData] = useState(null);
  const [cutoffData, setCutoffData] = useState({
    general: 0,
    obc: 0,
    sc: 0,
    st: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    setLoading(true);
    try {
      const res = await testSeriesService.getTest(seriesId, testId);
      setTestData(res.data);
    } catch (e) {
      toast.error("Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleUpdateDetails = async () => {
    try {
      await testSeriesService.updateTest(seriesId, testId, testData);
      toast.success("Details Updated");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleUpdateInstructions = async () => {
    try {
      await testSeriesService.updateInstructions(seriesId, testId, {
        instructionsPage1: testData.instructionsPage1,
        instructionsPage2: testData.instructionsPage2,
        instructionsPage3: testData.instructionsPage3,
      });
      toast.success("Instructions Saved");
    } catch (e) {
      toast.error("Failed");
    }
  };

  // Section & Question Logic
  const handleAddSection = async () => {
    const title = prompt("Section Title:");
    if (!title) return;
    try {
      await testSeriesService.addSection(seriesId, testId, {
        title,
        order: testData.sections.length + 1,
        noOfQuestions: 0,
      });
      fetchTest();
      toast.success("Section Added");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleAddQuestion = async (sectionId) => {
    try {
      console.log("Adding question with data:", {
        questionText: "New Question - Click to edit",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        marks: testData.positiveMarks || 1,
        negativeMarks: testData.negativeMarks || 0,
      });
      await testSeriesService.addQuestion(seriesId, testId, sectionId, {
        questionText: "New Question - Click to edit",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        marks: testData.positiveMarks || 1,
        negativeMarks: testData.negativeMarks || 0,
      });
      fetchTest();
      toast.success("Question Added");
    } catch (e) {
      toast.error("Failed to add question");
      console.error("Full error:", e);
      console.error("Error response:", e.response?.data);
      console.error("Error status:", e.response?.status);
    }
  };

  const handleUpdateQuestion = async (sectionId, questionId, updates) => {
    try {
      await testSeriesService.updateQuestion(
        seriesId,
        testId,
        sectionId,
        questionId,
        updates,
      );
      toast.success("Question Updated");
      fetchTest();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleDeleteQuestion = async (sectionId, questionId) => {
    if (!confirm("Delete this question?")) return;
    try {
      await testSeriesService.deleteQuestion(
        seriesId,
        testId,
        sectionId,
        questionId,
      );
      fetchTest();
      toast.success("Question Deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("explanationVideo", file);
    setUploading(true);
    try {
      await testSeriesService.updateExplanationVideo(
        seriesId,
        testId,
        formData,
      );
      toast.success("Video Uploaded!");
      fetchTest();
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCutoff = async () => {
    try {
      await testSeriesService.setCutoff(seriesId, testId, cutoffData);
      toast.success("Cutoff Saved Successfully!");
    } catch (e) {
      toast.error("Failed to save cutoff");
    }
  };

  if (!testData) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-b-2 border-white/20 px-6 py-4 flex justify-between items-center shrink-0 shadow-2xl z-10"
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

        <div className="relative flex items-center gap-4">
          <motion.button
            onClick={() => navigate(`/test-series/${seriesId}`)}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 hover:bg-white/20 rounded-xl text-white backdrop-blur-md border border-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="font-bold text-white text-xl">
                {testData.testName}
              </h1>
            </div>
            <p className="text-sm text-indigo-100 mt-1">
              🏛️ Test Designer Studio
            </p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative flex gap-2"
        >
          <motion.button
            onClick={handleUpdateDetails}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
          >
            <Save className="w-5 h-5" /> 💾 Save All
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-64 bg-white border-r-2 border-indigo-100 flex flex-col p-4 gap-2 shadow-xl"
        >
          {[
            {
              id: "details",
              label: "Basic Details",
              icon: FileText,
              emoji: "📝",
            },
            {
              id: "instructions",
              label: "Instructions",
              icon: HelpCircle,
              emoji: "❓",
            },
            {
              id: "sections",
              label: "Sections & Questions",
              icon: Layout,
              emoji: "🗂️",
            },
            { id: "cutoff", label: "Cutoffs", icon: Scissors, emoji: "✂️" },
            {
              id: "video",
              label: "Explanation Video",
              icon: Video,
              emoji: "🎥",
            },
          ].map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "text-slate-600 hover:bg-indigo-50"}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex items-center gap-2">
                {item.emoji} {item.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-xl border-2 border-indigo-100"
            >
              <div className="flex items-center gap-3 pb-4 border-b-2 border-indigo-200">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ⚙️ Test Configuration
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    📝 Test Name
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-sm font-medium transition-all"
                    value={testData.testName}
                    onChange={(e) =>
                      setTestData({ ...testData, testName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    ⏱️ Duration (Mins)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm font-medium transition-all"
                    placeholder="e.g. 120"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    🎯 Total Marks
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition-all"
                    value={testData.totalMarks}
                    onChange={(e) =>
                      setTestData({ ...testData, totalMarks: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <HelpCircle className="w-4 h-4 text-green-600" />❓
                    Questions
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 text-sm font-medium transition-all"
                    value={testData.noOfQuestions}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        noOfQuestions: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                    <Plus className="w-4 h-4 text-green-600" />✅ Positive Marks
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 text-sm font-bold transition-all text-green-600"
                    value={testData.positiveMarks}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        positiveMarks: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
                    <Trash2 className="w-4 h-4 text-red-600" />❌ Negative Marks
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 text-sm font-bold transition-all text-red-600"
                    value={testData.negativeMarks}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        negativeMarks: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* INSTRUCTIONS TAB */}
          {activeTab === "instructions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl text-white">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-7 h-7" />
                  <div>
                    <h2 className="text-2xl font-bold">📋 Test Instructions</h2>
                    <p className="text-indigo-100 text-sm">
                      Configure instructions shown before test starts
                    </p>
                  </div>
                </div>
              </div>

              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-100"
                >
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-indigo-100">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white font-bold shadow-lg">
                      {i}
                    </div>
                    <label className="text-lg font-bold text-slate-800">
                      📄 Page {i} Content
                    </label>
                    <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      HTML Supported
                    </span>
                  </div>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-indigo-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-mono text-sm transition-all resize-none"
                    rows="8"
                    value={testData[`instructionsPage${i}`] || ""}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        [`instructionsPage${i}`]: e.target.value,
                      })
                    }
                    placeholder={`Enter HTML or plain text for instruction page ${i}...\n\nExample:\n<h3>General Instructions</h3>\n<ul>\n  <li>Read all questions carefully</li>\n  <li>Time limit: 120 minutes</li>\n</ul>`}
                  />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end"
              >
                <motion.button
                  onClick={handleUpdateInstructions}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> 💾 Save Instructions
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* SECTIONS & QUESTIONS TAB */}
          {activeTab === "sections" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 text-white">
                  <Layout className="w-7 h-7" />
                  <div>
                    <h2 className="text-2xl font-bold">🗂️ Sections</h2>
                    <p className="text-indigo-100 text-sm">
                      ({testData.sections?.length || 0} sections)
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleAddSection}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> ✨ Add Section
                </motion.button>
              </div>

              <AnimatePresence>
                {testData.sections?.map((section, sIndex) => (
                  <motion.div
                    key={section._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: sIndex * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-5 border-b-2 border-indigo-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <GripVertical className="text-slate-400 cursor-grab hover:text-indigo-600 transition-colors" />
                        <input
                          className="bg-transparent font-bold text-slate-800 outline-none text-lg px-2 py-1 rounded-lg hover:bg-white/50 transition-all"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...testData.sections];
                            newSections[sIndex].title = e.target.value;
                            setTestData({ ...testData, sections: newSections });
                          }}
                        />
                        <span className="px-3 py-1 bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold">
                          {section.questions.length} Questions
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleAddQuestion(section._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Question
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="p-4 space-y-4">
                      {section.questions.length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-4 italic">
                          No questions yet
                        </div>
                      )}
                      {section.questions.map((q, qIndex) => (
                        <motion.div
                          key={q._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: qIndex * 0.05 }}
                          className="border-2 border-indigo-100 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all bg-white"
                        >
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-bold shadow">
                                {qIndex + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                Question #{qIndex + 1}
                              </span>
                            </div>
                            <motion.button
                              onClick={() =>
                                handleDeleteQuestion(section._id, q._id)
                              }
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <textarea
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-purple-200 rounded-xl resize-none outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-sm text-slate-700 font-medium mb-4 transition-all"
                            rows="3"
                            value={q.questionText}
                            onChange={(e) =>
                              handleUpdateQuestion(section._id, q._id, {
                                questionText: e.target.value,
                              })
                            }
                            placeholder="Enter your question here..."
                          />

                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-bold text-slate-600">
                                Options (Click to select correct answer)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {q.options.map((opt, oIndex) => (
                                <motion.div
                                  key={oIndex}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() =>
                                    handleUpdateQuestion(section._id, q._id, {
                                      correctOptionIndex: oIndex,
                                    })
                                  }
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                    q.correctOptionIndex === oIndex
                                      ? "bg-green-50 border-green-400 shadow-lg"
                                      : "bg-white border-slate-200 hover:border-indigo-300"
                                  }`}
                                >
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      q.correctOptionIndex === oIndex
                                        ? "bg-green-500 text-white shadow-lg"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIndex)}
                                  </div>
                                  <input
                                    className="bg-transparent w-full text-sm outline-none font-medium"
                                    value={opt}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const newOptions = [...q.options];
                                      newOptions[oIndex] = e.target.value;
                                      handleUpdateQuestion(section._id, q._id, {
                                        options: newOptions,
                                      });
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  />
                                  {q.correctOptionIndex === oIndex && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="text-green-600 font-bold text-xs"
                                    >
                                      ✓ Correct
                                    </motion.span>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* VIDEO TAB */}
          {activeTab === "video" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl text-white mb-6">
                <div className="flex items-center gap-3">
                  <Video className="w-7 h-7" />
                  <div>
                    <h2 className="text-2xl font-bold">🎥 Explanation Video</h2>
                    <p className="text-indigo-100 text-sm">
                      Upload a complete test explanation video
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-8">
                  <div className="text-center">
                    {testData.totalExplanationVideoUrl ? (
                      <div className="space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Video className="w-10 h-10 text-green-600" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">
                          ✅ Video Uploaded Successfully!
                        </h3>
                        <p className="text-sm text-slate-600">
                          Your explanation video is ready
                        </p>
                        <a
                          href={testData.totalExplanationVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                        >
                          <Video className="w-5 h-5" /> View Video
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Video className="w-10 h-10 text-slate-300" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                          📹 No Video Uploaded Yet
                        </h3>
                        <p className="text-sm text-slate-500">
                          Upload an explanation video for this test
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 border-t-2 border-indigo-100">
                  <label className="block">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="video-upload"
                    />
                    <motion.label
                      htmlFor="video-upload"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        uploading
                          ? "bg-slate-100 border-slate-300 cursor-not-allowed"
                          : "bg-indigo-50 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          <span className="font-bold text-indigo-600">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-indigo-600" />
                          <span className="font-bold text-indigo-600">
                            📤 Choose Video File
                          </span>
                        </>
                      )}
                    </motion.label>
                  </label>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Supported formats: MP4, AVI, MOV • Max size: 500MB
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* CUTOFF TAB */}
          {activeTab === "cutoff" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl text-white mb-6">
                <div className="flex items-center gap-3">
                  <Scissors className="w-7 h-7" />
                  <div>
                    <h2 className="text-2xl font-bold">✂️ Cutoff Manager</h2>
                    <p className="text-indigo-100 text-sm">
                      Set category-wise qualifying cutoffs
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-xl border-2 border-indigo-100"
              >
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      key: "general",
                      label: "General",
                      color: "blue",
                      emoji: "👥",
                    },
                    { key: "obc", label: "OBC", color: "green", emoji: "🟢" },
                    { key: "sc", label: "SC", color: "purple", emoji: "🟣" },
                    { key: "st", label: "ST", color: "orange", emoji: "🟠" },
                  ].map((cat, index) => (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label
                        className={`flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2`}
                      >
                        <span className="text-lg">{cat.emoji}</span>
                        {cat.label} Category
                      </label>
                      <input
                        type="number"
                        value={cutoffData[cat.key]}
                        onChange={(e) =>
                          setCutoffData({
                            ...cutoffData,
                            [cat.key]: parseInt(e.target.value) || 0,
                          })
                        }
                        className={`w-full px-4 py-3 border-2 border-${cat.color}-200 rounded-xl outline-none focus:border-${cat.color}-500 focus:ring-4 focus:ring-${cat.color}-100 text-center text-lg font-bold transition-all`}
                        placeholder="0"
                        min="0"
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-6 border-t-2 border-indigo-100"
                >
                  <motion.button
                    onClick={handleSaveCutoff}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" /> 💾 Save Cutoff Settings
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utils
const label = "block text-xs font-bold text-slate-500 uppercase mb-1.5";
const input =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700";
const btnPrimary =
  "px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all";

export default TestDesigner;
