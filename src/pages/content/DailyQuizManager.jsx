import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDailyQuizzes,
  createDailyQuiz,
  updateDailyQuiz,
  deleteDailyQuiz,
} from "../../store/slices/dailyQuizSlice";
import DailyQuizModal from "../../components/modals/DailyQuizModal";
import DataTable from "../../components/DataTable";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const DailyQuizManager = () => {
  const dispatch = useDispatch();
  const {
    quizzes = [],
    loading,
    error,
  } = useSelector((state) => state.dailyQuizzes || {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterAccessType, setFilterAccessType] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");

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

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    dispatch(fetchDailyQuizzes());
  };

  const handleCreate = () => {
    setSelectedQuiz(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await dispatch(deleteDailyQuiz(id)).unwrap();
        toast.success("Quiz deleted successfully");
        loadQuizzes();
      } catch (error) {
        toast.error(error.message || "Failed to delete quiz");
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedQuiz) {
        await dispatch(
          updateDailyQuiz({ id: selectedQuiz._id, data: data }),
        ).unwrap();
        toast.success("Quiz updated successfully");
      } else {
        await dispatch(createDailyQuiz(data)).unwrap();
        toast.success("Quiz created successfully");
      }
      setIsModalOpen(false);
      loadQuizzes();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterMonth("");
    setFilterAccessType("");
    setFilterIsActive("");
  };

  const filteredQuizzes = (quizzes || []).filter((quiz) => {
    const matchesSearch = quiz.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMonth = !filterMonth || quiz.month === filterMonth;
    const matchesAccessType =
      !filterAccessType || quiz.accessType === filterAccessType;
    const matchesActive =
      filterIsActive === "" || quiz.isActive === (filterIsActive === "true");

    return matchesSearch && matchesMonth && matchesAccessType && matchesActive;
  });

  const columns = [
    {
      key: "name",
      label: "Quiz Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{row.name}</span>
          {!row.isActive && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      key: "month",
      label: "Month",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">
          {row.month}
        </span>
      ),
    },
    {
      key: "examDate",
      label: "Exam Date",
      render: (row) =>
        row.examDate ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            {new Date(row.examDate).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "categories",
      label: "Category",
      render: (row) => (
        <span className="text-sm text-slate-600">
          {row.categories?.[0]?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "languages",
      label: "Language",
      render: (row) => (
        <span className="text-sm text-slate-600">
          {row.languages?.[0]?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "totalQuestions",
      label: "Questions",
      render: (row) => (
        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold">
          {row.totalQuestions || 0}
        </span>
      ),
    },
    {
      key: "totalMarks",
      label: "Total Marks",
      render: (row) => (
        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-bold">
          {row.totalMarks || 0}
        </span>
      ),
    },
    {
      key: "accessType",
      label: "Access",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-bold ${
            row.accessType === "FREE"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {row.accessType}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) =>
        row.isActive ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            📝 Daily Quizzes
          </h1>
          <p className="text-slate-500 mt-1">
            Manage daily quiz content with sections and questions
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-5 gap-4">
          {/* Search */}
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Months</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {/* Access Type Filter */}
          <select
            value={filterAccessType}
            onChange={(e) => setFilterAccessType(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Access Types</option>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>

          {/* Active Filter */}
          <select
            value={filterIsActive}
            onChange={(e) => setFilterIsActive(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {(searchTerm || filterMonth || filterAccessType || filterIsActive) && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-bold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
          <p className="text-blue-600 text-sm font-bold">Total Quizzes</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">
            {(quizzes || []).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
          <p className="text-green-600 text-sm font-bold">Active Quizzes</p>
          <p className="text-3xl font-bold text-green-700 mt-1">
            {(quizzes || []).filter((q) => q.isActive).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
          <p className="text-purple-600 text-sm font-bold">Free Quizzes</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">
            {(quizzes || []).filter((q) => q.accessType === "FREE").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200">
          <p className="text-amber-600 text-sm font-bold">Paid Quizzes</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">
            {(quizzes || []).filter((q) => q.accessType === "PAID").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredQuizzes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modal */}
      <DailyQuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedQuiz}
      />
    </div>
  );
};

export default DailyQuizManager;
