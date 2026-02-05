import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Layers,
  FileSpreadsheet,
  Download,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import DataTable from "../../components/DataTable";
import CourseModal from "../../components/modals/CourseModal";
import SearchBar from "../../components/common/SearchBar";
import ActionButton from "../../components/common/ActionButton";
import {
  fetchCourses,
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from "../../store/slices/courseSlice";

const CourseManager = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.courses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ contentType: "ONLINE_COURSE" });

  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const searchLower = searchTerm.toLowerCase();
    return courses.filter(
      (course) =>
        course.name?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower),
    );
  }, [courses, searchTerm]);

  const statistics = useMemo(() => {
    const coursesToUse = filteredCourses || [];
    if (coursesToUse.length === 0)
      return {
        totalCourses: 0,
        activeCourses: 0,
        inactiveCourses: 0,
        freeCourses: 0,
        paidCourses: 0,
        totalClasses: 0,
        totalMaterials: 0,
        totalRevenue: 0,
      };

    return {
      totalCourses: coursesToUse.length,
      activeCourses: coursesToUse.filter((c) => c.isActive).length,
      inactiveCourses: coursesToUse.filter((c) => !c.isActive).length,
      freeCourses: coursesToUse.filter((c) => c.accessType === "FREE").length,
      paidCourses: coursesToUse.filter((c) => c.accessType === "PAID").length,
      totalClasses: coursesToUse.reduce(
        (sum, c) => sum + (c.classes?.length || 0),
        0,
      ),
      totalMaterials: coursesToUse.reduce(
        (sum, c) => sum + (c.studyMaterials?.length || 0),
        0,
      ),
      totalRevenue: coursesToUse
        .filter((c) => c.accessType === "PAID")
        .reduce((sum, c) => sum + (c.discountPrice || c.originalPrice || 0), 0),
    };
  }, [filteredCourses]);

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await dispatch(deleteCourse(id)).unwrap();
        dispatch(fetchCourses(filters));
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleToggleActive = async (course) => {
    try {
      if (course.isActive) await dispatch(unpublishCourse(course._id)).unwrap();
      else await dispatch(publishCourse(course._id)).unwrap();
      dispatch(fetchCourses(filters));
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const htmlTable = `
      <table>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Access Type</th>
            <th>Price</th>
            <th>Status</th>
            <th>Classes</th>
            <th>Materials</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
          ${filteredCourses
            .map(
              (course) => `
            <tr>
              <td>${course.name || "N/A"}</td>
              <td>${course.accessType || "N/A"}</td>
              <td>₹${course.accessType === "FREE" ? 0 : course.discountPrice || course.originalPrice || 0}</td>
              <td>${course.isActive ? "Active" : "Inactive"}</td>
              <td>${course.classes?.length || 0}</td>
              <td>${course.studyMaterials?.length || 0}</td>
              <td>${course.categories?.map((c) => c.name).join(", ") || "N/A"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;

    const blob = new Blob([htmlTable], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `courses_${new Date().toISOString().split("T")[0]}.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Courses Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; flex-wrap: wrap; }
            .stat-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin: 10px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .stat-label { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Courses Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${statistics.totalCourses}</div>
              <div class="stat-label">Total Courses</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${statistics.activeCourses}</div>
              <div class="stat-label">Active Courses</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">₹${statistics.totalRevenue.toLocaleString()}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCourses
                .map(
                  (course) => `
                <tr>
                  <td>${course.name || "N/A"}</td>
                  <td>${course.accessType || "N/A"}</td>
                  <td>₹${course.accessType === "FREE" ? 0 : course.discountPrice || course.originalPrice || 0}</td>
                  <td>${course.isActive ? "Active" : "Inactive"}</td>
                  <td>${course.classes?.length || 0} Classes, ${course.studyMaterials?.length || 0} Materials</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">Print / Save as PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const columns = [
    {
      key: "thumbnail",
      label: "Image",
      render: (course) => (
        <div className="w-20 h-20 flex-shrink-0 group">
          {course.thumbnail ? (
            <div className="relative overflow-hidden rounded-xl shadow-lg border-2 border-indigo-100 dark:border-indigo-800 ring-2 ring-indigo-50 dark:ring-indigo-900/30">
              <img
                src={course.thumbnail}
                alt={course.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800 shadow-inner">
              <Video
                className="text-indigo-500 dark:text-indigo-400"
                size={24}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "info",
      label: "Course Info",
      render: (course) => (
        <div className="flex-1 min-w-[250px] space-y-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            {course.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {course.languages && course.languages.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {course.languages[0].name}
              </span>
            )}
            {course.accessType && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border ${
                  course.accessType === "FREE"
                    ? "bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                    : "bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                }`}
              >
                {course.accessType === "FREE" ? "🎁" : "💎"} {course.accessType}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "stats",
      label: "Content",
      render: (course) => (
        <div className="flex flex-col gap-2 text-xs font-semibold min-w-[140px]">
          {course.tutors?.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 text-violet-700 dark:text-violet-300 rounded-lg border border-violet-200 dark:border-violet-700 shadow-sm">
              <Users size={14} className="flex-shrink-0" />
              <span>{course.tutors.length} Tutors</span>
            </div>
          )}
          {course.classes?.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
              <Video size={14} className="flex-shrink-0" />
              <span>{course.classes.length} Classes</span>
            </div>
          )}
          {course.studyMaterials?.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-700 shadow-sm">
              <FileText size={14} className="flex-shrink-0" />
              <span>{course.studyMaterials.length} Files</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (course) => (
        <div className="min-w-[120px]">
          {course.accessType === "FREE" ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 text-green-700 dark:text-green-300 font-black text-base rounded-xl border-2 border-green-200 dark:border-green-700 shadow-md">
              🎉 FREE
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                ₹
                {(
                  course.discountPrice ||
                  course.originalPrice ||
                  0
                ).toLocaleString()}
              </div>
              {course.originalPrice > course.discountPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                    ₹{course.originalPrice.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md">
                    {Math.round(
                      ((course.originalPrice - course.discountPrice) /
                        course.originalPrice) *
                        100,
                    )}
                    % OFF
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (course) => (
        <button
          onClick={() => handleToggleActive(course)}
          className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            course.isActive
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-200 dark:shadow-green-900/30"
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-red-200 dark:shadow-red-900/30"
          }`}
        >
          {course.isActive ? (
            <>
              <CheckCircle size={16} className="animate-pulse" />
              <span>ACTIVE</span>
            </>
          ) : (
            <>
              <XCircle size={16} />
              <span>INACTIVE</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(course)}
            className="group p-3 text-indigo-600 dark:text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700"
            title="Edit Course"
          >
            <Edit
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <button
            onClick={() => handleDelete(course._id)}
            className="group p-3 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border-2 border-transparent hover:border-red-200 dark:hover:border-red-700"
            title="Delete Course"
          >
            <Trash2
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    // FIX: Removed w-full, min-h-screen, and gradients from the ROOT container.
    // Standard padding ensures it fits inside your dashboard content area.
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER CARD - Now floating inside the content area */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                Course Manager
                <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full border border-white/30">
                  {statistics.totalCourses} Courses
                </span>
              </h1>
              <p className="text-indigo-100 text-sm font-medium flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-green-300" /> Manage your
                online courses
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ActionButton
              onClick={() => dispatch(fetchCourses(filters))}
              icon={RotateCcw}
              variant="secondary"
              size="sm"
            >
              Refresh
            </ActionButton>
            <ActionButton
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
              variant="success"
              size="sm"
            >
              Add New
            </ActionButton>
          </div>
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={statistics.totalCourses}
          icon={Layers}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Courses"
          value={statistics.activeCourses}
          icon={CheckCircle}
          color="bg-emerald-600"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${statistics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-600"
        />
        <StatCard
          title="Total Classes"
          value={statistics.totalClasses}
          icon={Video}
          color="bg-orange-600"
        />
      </div>

      {/* TOOLBAR */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search courses..."
          />
        </div>
        <div className="flex gap-2">
          <ActionButton
            onClick={handleExportExcel}
            icon={FileSpreadsheet}
            variant="success"
            size="sm"
          >
            Excel
          </ActionButton>
          <ActionButton
            onClick={handleExportPDF}
            icon={Download}
            variant="danger"
            size="sm"
          >
            PDF
          </ActionButton>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* overflow-x-auto ensures the table scrolls INSIDE this card if screen is small */}
        <div className="overflow-x-auto">
          <DataTable
            data={filteredCourses}
            columns={columns}
            loading={loading}
            hideSearch={true}
          />
        </div>
      </div>

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
        onSuccess={() => dispatch(fetchCourses(filters))}
      />
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div
    className={`relative overflow-hidden ${color} rounded-xl p-5 text-white shadow-md`}
  >
    <div className="relative z-10 flex justify-between items-center">
      <div>
        <p className="text-white/80 text-xs font-bold uppercase">{title}</p>
        <h3 className="text-2xl font-black mt-0.5">{value}</h3>
      </div>
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export default CourseManager;
