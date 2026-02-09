import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  Layers,
  FileText,
  BookOpen,
  AlignLeft,
  Link as LinkIcon,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";

// Services
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";

const DAILY_QUIZ_CONTENT_TYPE = "DAILY_QUIZ";

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const DailyQuizModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    month: "",
    examDate: "",
    categoryIds: "",
    subCategoryIds: "",
    languageIds: "",
    freeMockLinks: "",
    instructions: "",
    sections: [],
    isActive: true,
  });

  // Initialize modal
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

  const loadDropdowns = async () => {
    try {
      const [catRes, langRes] = await Promise.all([
        categoryService.getAll(DAILY_QUIZ_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);

      setCategories(catRes.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(langRes.data.map((l) => ({ label: l.name, value: l._id })));
    } catch (error) {
      toast.error("Failed to load dropdowns");
    }
  };

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (!formData.categoryIds) {
        setSubCategories([]);
        return;
      }

      try {
        const res = await subCategoryService.getAll(
          DAILY_QUIZ_CONTENT_TYPE,
          formData.categoryIds,
        );
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (error) {
        console.error("Failed to load subcategories:", error);
      }
    };

    loadSubCategories();
  }, [formData.categoryIds]);

  const populateForm = (data) => {
    setFormData({
      name: data.name || "",
      month: data.month || "",
      examDate: data.examDate ? data.examDate.split("T")[0] : "",
      categoryIds: data.categories?.[0]?._id || data.categories?.[0] || "",
      subCategoryIds:
        data.subCategories?.[0]?._id || data.subCategories?.[0] || "",
      languageIds: data.languages?.[0]?._id || data.languages?.[0] || "",
      freeMockLinks: data.freeMockLinks || "",
      instructions: data.instructions || "",
      sections: data.sections || [],
      isActive: data.isActive ?? true,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      month: "",
      examDate: "",
      categoryIds: "",
      subCategoryIds: "",
      languageIds: "",
      freeMockLinks: "",
      instructions: "",
      sections: [],
      isActive: true,
    });
    setActiveTab("basic");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Helper for CustomDropdown
  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- SECTION MANAGEMENT ---
  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          title: "",
          order: formData.sections.length + 1,
          questions: [],
        },
      ],
    });
  };

  const updateSection = (index, field, value) => {
    setFormData({
      ...formData,
      sections: formData.sections.map((section, idx) =>
        idx === index ? { ...section, [field]: value } : section,
      ),
    });
  };

  const deleteSection = (index) => {
    if (!window.confirm("Delete this section and all its questions?")) return;
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index),
    });
  };

  // --- QUESTION MANAGEMENT ---
  const addQuestion = (sectionIndex) => {
    setFormData({
      ...formData,
      sections: formData.sections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              questionNumber: section.questions.length + 1,
              questionText: "",
              questionType: "MCQ",
              options: ["", "", "", ""],
              correctOptionIndex: 0,
              explanation: "",
              marks: 1,
              negativeMarks: 0,
            },
          ],
        };
      }),
    });
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    setFormData({
      ...formData,
      sections: formData.sections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, qIdx) => {
            if (qIdx !== questionIndex) return question;
            return { ...question, [field]: value };
          }),
        };
      }),
    });
  };

  const updateOption = (sectionIndex, questionIndex, optionIndex, value) => {
    setFormData({
      ...formData,
      sections: formData.sections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, qIdx) => {
            if (qIdx !== questionIndex) return question;
            return {
              ...question,
              options: question.options.map((opt, oIdx) =>
                oIdx === optionIndex ? value : opt,
              ),
            };
          }),
        };
      }),
    });
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    setFormData({
      ...formData,
      sections: formData.sections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.filter(
            (_, qIdx) => qIdx !== questionIndex,
          ),
        };
      }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare data structure expected by backend
    const submitData = {
      quiz: {
        name: formData.name,
        month: formData.month,
        examDate: formData.examDate,
        categoryIds: formData.categoryIds ? [formData.categoryIds] : [],
        subCategoryIds: formData.subCategoryIds
          ? [formData.subCategoryIds]
          : [],
        languageIds: formData.languageIds ? [formData.languageIds] : [],
        freeMockLinks: formData.freeMockLinks,
        instructions: formData.instructions,
        sections: formData.sections,
        isActive: formData.isActive,
      },
    };

    try {
      await onSubmit(submitData);
      // Form will be reset by parent component closing modal
    } catch (error) {
      toast.error("Failed to save quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            {initialData ? "Edit Daily Quiz" : "Create New Daily Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
          {[
            { id: "basic", label: "Basic Info", icon: FileText },
            { id: "sections", label: "Sections & Questions", icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-bold capitalize transition-all flex items-center justify-center gap-2 relative ${
                activeTab === tab.id
                  ? "text-indigo-600 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
          <form
            id="daily-quiz-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* --- BASIC INFO TAB --- */}
            {activeTab === "basic" && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Quiz Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium"
                    placeholder="e.g. Daily Current Affairs Quiz - 12 Oct"
                    required
                  />
                </div>

                {/* Grid 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <CustomDropdown
                      label="Month"
                      value={formData.month}
                      onChange={(val) =>
                        setFormData({ ...formData, month: val })
                      }
                      options={MONTHS.map((m) => ({ label: m, value: m }))}
                      placeholder="Select Month"
                      icon={Calendar}
                      searchable
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      name="examDate"
                      value={formData.examDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Grid 2 - Classifications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <CustomDropdown
                    label="Category"
                    options={categories}
                    value={formData.categoryIds}
                    onChange={(v) => handleDropdownChange("categoryIds", v)}
                    icon={Layers}
                    placeholder="Select Category"
                    required
                    searchable
                  />
                  <CustomDropdown
                    label="Sub Category"
                    options={subCategories}
                    value={formData.subCategoryIds}
                    onChange={(v) => handleDropdownChange("subCategoryIds", v)}
                    icon={Layers}
                    placeholder="Select Sub Category"
                    disabled={!formData.categoryIds}
                    required
                    searchable
                  />
                  <CustomDropdown
                    label="Language"
                    options={languages}
                    value={formData.languageIds}
                    onChange={(v) => handleDropdownChange("languageIds", v)}
                    icon={FileText}
                    placeholder="Select Language"
                    required
                    searchable
                  />
                </div>

                {/* Free Links */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Free Mock Link (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="freeMockLinks"
                      value={formData.freeMockLinks}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      placeholder="Paste URL here..."
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
                    placeholder="Enter instructions for the students..."
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                    />
                    <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <label
                    htmlFor="isActive"
                    className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                  >
                    Quiz is Active (Visible to users)
                  </label>
                </div>
              </div>
            )}

            {/* --- SECTIONS TAB --- */}
            {activeTab === "sections" && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <h3 className="text-lg font-bold text-indigo-900">
                      Quiz Content
                    </h3>
                    <p className="text-sm text-indigo-600">
                      Manage sections and questions for this quiz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSection}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>

                {formData.sections.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      No sections added yet.
                    </p>
                    <button
                      type="button"
                      onClick={addSection}
                      className="text-indigo-600 text-sm font-bold mt-2 hover:underline"
                    >
                      Create your first section
                    </button>
                  </div>
                )}

                {formData.sections.map((section, sIndex) => (
                  <div
                    key={sIndex}
                    className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden shadow-sm"
                  >
                    {/* Section Header */}
                    <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Section Title (e.g. General Knowledge)"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(sIndex, "title", e.target.value)
                          }
                          className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-400 text-lg p-0"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide px-2">
                        {section.questions.length} Questions
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteSection(sIndex)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Questions List */}
                      {section.questions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group"
                        >
                          {/* Question Toolbar */}
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                              Q{qIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteQuestion(sIndex, qIndex)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Question Text */}
                          <div className="mb-4">
                            <textarea
                              placeholder="Enter question text here..."
                              value={question.questionText}
                              onChange={(e) =>
                                updateQuestion(
                                  sIndex,
                                  qIndex,
                                  "questionText",
                                  e.target.value,
                                )
                              }
                              rows="2"
                              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm font-medium resize-y"
                            />
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${question.correctOptionIndex === oIndex ? "bg-green-500 border-green-500 text-white" : "bg-slate-100 border-slate-200 text-slate-500"}`}
                                >
                                  {String.fromCharCode(65 + oIndex)}
                                </div>
                                <input
                                  type="text"
                                  placeholder={`Option ${oIndex + 1}`}
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(
                                      sIndex,
                                      qIndex,
                                      oIndex,
                                      e.target.value,
                                    )
                                  }
                                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none ${question.correctOptionIndex === oIndex ? "border-green-300 bg-green-50" : "border-slate-200"}`}
                                />
                                <input
                                  type="radio"
                                  name={`correct-${sIndex}-${qIndex}`}
                                  checked={
                                    question.correctOptionIndex === oIndex
                                  }
                                  onChange={() =>
                                    updateQuestion(
                                      sIndex,
                                      qIndex,
                                      "correctOptionIndex",
                                      oIndex,
                                    )
                                  }
                                  className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Footer: Marks & Explanation */}
                          <div className="flex flex-col md:flex-row gap-4 pt-3 border-t border-slate-100">
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">
                                  Marks:
                                </span>
                                <input
                                  type="number"
                                  value={question.marks}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIndex,
                                      qIndex,
                                      "marks",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-16 px-2 py-1 border border-slate-200 rounded-md text-sm font-medium"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">
                                  Neg. Marks:
                                </span>
                                <input
                                  type="number"
                                  value={question.negativeMarks}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIndex,
                                      qIndex,
                                      "negativeMarks",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-16 px-2 py-1 border border-slate-200 rounded-md text-sm font-medium text-red-600"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Explanation (Optional)"
                                value={question.explanation}
                                onChange={(e) =>
                                  updateQuestion(
                                    sIndex,
                                    qIndex,
                                    "explanation",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addQuestion(sIndex)}
                        className="w-full py-2.5 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 hover:bg-indigo-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Question to{" "}
                        {section.title || "Section"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="daily-quiz-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />{" "}
            {initialData ? "Save Changes" : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DailyQuizModal;
