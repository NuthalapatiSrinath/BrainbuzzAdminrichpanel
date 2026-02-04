import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Video,
  Newspaper,
  ShoppingCart,
  Tag,
  Image,
  Users,
  FileQuestion,
  Languages,
  Clock,
  Book,
  Layers,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
  Star,
  Zap,
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";

// Import actions
import { fetchCoupons } from "../store/slices/couponSlice";
import { fetchOrders } from "../store/slices/orderSlice";
import { fetchCourses } from "../store/slices/courseSlice";
import { fetchLiveClasses } from "../store/slices/liveClassSlice";
import { fetchTestSeries } from "../store/slices/testSeriesSlice";
import { fetchCurrentAffairs } from "../store/slices/currentAffairsSlice";
import { fetchEBooks } from "../store/slices/eBookSlice";
import { fetchDailyQuizzes } from "../store/slices/dailyQuizSlice";
import { fetchLanguages } from "../store/slices/languageSlice";
import { fetchValidities } from "../store/slices/validitySlice";
import { fetchPublications } from "../store/slices/publicationSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [animatedCounts, setAnimatedCounts] = useState({});

  // Get data from Redux store
  const { items: coupons = [] } = useSelector((state) => state.coupons);
  const { items: orders = [] } = useSelector((state) => state.orders);
  const { courses = [] } = useSelector((state) => state.courses);
  const { items: liveClasses = [] } = useSelector((state) => state.liveClasses);
  const { testSeries = [] } = useSelector((state) => state.testSeries);
  const { items: currentAffairs = [] } = useSelector(
    (state) => state.currentAffairs,
  );
  const { items: ebooks = [] } = useSelector((state) => state.ebooks);
  const { items: dailyQuizzes = [] } = useSelector(
    (state) => state.dailyQuizzes,
  );
  const { items: languages = [] } = useSelector((state) => state.languages);
  const { items: validities = [] } = useSelector((state) => state.validities);
  const { items: publications = [] } = useSelector(
    (state) => state.publications,
  );

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchCoupons());
    dispatch(fetchOrders());
    dispatch(fetchCourses());
    dispatch(fetchLiveClasses({}));
    dispatch(fetchTestSeries());
    dispatch(fetchCurrentAffairs());
    dispatch(fetchEBooks());
    dispatch(fetchDailyQuizzes());
    dispatch(fetchLanguages());
    dispatch(fetchValidities());
    dispatch(fetchPublications());
  }, [dispatch]);

  // Calculate active/inactive counts
  const activeCourses = courses.filter((c) => c.isActive).length;
  const activeLiveClasses = liveClasses.filter((lc) => lc.isActive).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  // Calculate revenue
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  // Top performing stats - REAL DATA ONLY
  const topStats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      darkBg: "from-emerald-950/30 to-teal-950/30",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      darkBg: "from-blue-950/30 to-indigo-950/30",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      darkBg: "from-purple-950/30 to-pink-950/30",
    },
    {
      title: "Active Courses",
      value: activeCourses,
      icon: BookOpen,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      darkBg: "from-orange-950/30 to-red-950/30",
    },
  ];

  // Stats cards configuration
  const statsCards = [
    {
      title: "Online Courses",
      count: courses.length,
      active: activeCourses,
      icon: BookOpen,
      color: "blue",
      link: "/courses",
    },
    {
      title: "Live Classes",
      count: liveClasses.length,
      active: activeLiveClasses,
      icon: Video,
      color: "rose",
      link: "/live-classes",
    },
    {
      title: "Test Series",
      count: testSeries.length,
      icon: FileText,
      color: "purple",
      link: "/test-series",
    },
    {
      title: "Current Affairs",
      count: currentAffairs.length,
      icon: Newspaper,
      color: "green",
      link: "/current-affairs",
    },
    {
      title: "E-Books",
      count: ebooks.length,
      icon: Book,
      color: "orange",
      link: "/ebooks",
    },
    {
      title: "Daily Quizzes",
      count: dailyQuizzes.length,
      icon: Activity,
      color: "teal",
      link: "/daily-quizzes",
    },
    {
      title: "Orders",
      count: orders.length,
      pending: pendingOrders,
      icon: ShoppingCart,
      color: "indigo",
      link: "/orders",
    },
    {
      title: "Coupons",
      count: coupons.length,
      icon: Tag,
      color: "yellow",
      link: "/coupons",
    },
    {
      title: "Publications",
      count: publications.length,
      icon: FileQuestion,
      color: "cyan",
      link: "/publications",
    },
    {
      title: "Languages",
      count: languages.length,
      icon: Languages,
      color: "emerald",
      link: "/languages",
    },
    {
      title: "Validity Options",
      count: validities.length,
      icon: Clock,
      color: "amber",
      link: "/validity",
    },
  ];

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-200 dark:shadow-blue-900/30",
    rose: "from-rose-500 to-rose-600 shadow-rose-200 dark:shadow-rose-900/30",
    purple:
      "from-purple-500 to-purple-600 shadow-purple-200 dark:shadow-purple-900/30",
    green:
      "from-green-500 to-green-600 shadow-green-200 dark:shadow-green-900/30",
    orange:
      "from-orange-500 to-orange-600 shadow-orange-200 dark:shadow-orange-900/30",
    teal: "from-teal-500 to-teal-600 shadow-teal-200 dark:shadow-teal-900/30",
    indigo:
      "from-indigo-500 to-indigo-600 shadow-indigo-200 dark:shadow-indigo-900/30",
    pink: "from-pink-500 to-pink-600 shadow-pink-200 dark:shadow-pink-900/30",
    yellow:
      "from-yellow-500 to-yellow-600 shadow-yellow-200 dark:shadow-yellow-900/30",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-200 dark:shadow-cyan-900/30",
    violet:
      "from-violet-500 to-violet-600 shadow-violet-200 dark:shadow-violet-900/30",
    fuchsia:
      "from-fuchsia-500 to-fuchsia-600 shadow-fuchsia-200 dark:shadow-fuchsia-900/30",
    emerald:
      "from-emerald-500 to-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/30",
    amber:
      "from-amber-500 to-amber-600 shadow-amber-200 dark:shadow-amber-900/30",
  };

  const borderColors = {
    blue: "#3b82f6",
    rose: "#f43f5e",
    purple: "#a855f7",
    green: "#22c55e",
    orange: "#f97316",
    teal: "#14b8a6",
    indigo: "#6366f1",
    pink: "#ec4899",
    yellow: "#eab308",
    cyan: "#06b6d4",
    violet: "#8b5cf6",
    fuchsia: "#d946ef",
    emerald: "#10b981",
    amber: "#f59e0b",
  };

  // Learning Management Content - Only 8 core learning items (no coupons/orders)
  const learningContent = [
    { name: "Courses", value: courses.length, color: "#3b82f6" },
    { name: "Live Classes", value: liveClasses.length, color: "#f43f5e" },
    { name: "Test Series", value: testSeries.length, color: "#a855f7" },
    { name: "Current Affairs", value: currentAffairs.length, color: "#22c55e" },
    { name: "E-Books", value: ebooks.length, color: "#f97316" },
    { name: "Daily Quizzes", value: dailyQuizzes.length, color: "#14b8a6" },
    { name: "Publications", value: publications.length, color: "#06b6d4" },
    { name: "Languages", value: languages.length, color: "#10b981" },
  ];

  const totalLearningContent = learningContent.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20 p-6 space-y-6">
      {/* Hero Header with animated gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                Dashboard Overview
              </h1>
              <p className="text-white/90 text-lg">
                📊 Real-time analytics and insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Calendar className="w-5 h-5 text-white/80" />
            <p className="text-white/80 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Stats Cards - Large Animated Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {topStats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} dark:${stat.darkBg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white dark:border-gray-800`}
            >
              {/* Animated background circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 dark:bg-white/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 dark:bg-white/5 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Learning Management Content Distribution - PIE CHART ONLY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Visualization */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Learning Management Content
            </h3>
          </div>

          <div className="flex items-center justify-center">
            {/* Pie Chart */}
            <div className="relative w-80 h-80">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  className="text-gray-100 dark:text-gray-700"
                />
                {learningContent.map((item, index) => {
                  const percentage =
                    totalLearningContent > 0
                      ? (item.value / totalLearningContent) * 100
                      : 0;
                  const circumference = 2 * Math.PI * 140;
                  const offset =
                    circumference - (percentage / 100) * circumference;
                  const prevPercentages = learningContent
                    .slice(0, index)
                    .reduce(
                      (sum, i) => sum + (i.value / totalLearningContent) * 100,
                      0,
                    );
                  const rotation = (prevPercentages / 100) * 360;

                  return (
                    <circle
                      key={index}
                      cx="160"
                      cy="160"
                      r="140"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: "center",
                      }}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-gray-900 dark:text-white">
                  {totalLearningContent}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Total Learning Items
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {learningContent.map((item, index) => {
              const percentage =
                totalLearningContent > 0
                  ? ((item.value / totalLearningContent) * 100).toFixed(1)
                  : 0;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.value} ({percentage}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Quick Stats
            </h3>
          </div>

          <div className="space-y-4">
            {/* Active status */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  🟢 Active Courses
                </span>
                <span className="text-2xl font-black text-green-600">
                  {activeCourses}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Out of {courses.length} total courses
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl border-2 border-rose-200 dark:border-rose-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  🎥 Live Classes
                </span>
                <span className="text-2xl font-black text-rose-600">
                  {activeLiveClasses}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Active sessions running
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  ⏳ Pending Orders
                </span>
                <span className="text-2xl font-black text-orange-600">
                  {pendingOrders}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Awaiting processing
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  ✅ Completed
                </span>
                <span className="text-2xl font-black text-purple-600">
                  {completedOrders}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Successfully delivered
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* All Content Cards Grid */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            All Content Modules
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => navigate(stat.link)}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer"
                style={{
                  borderColor: borderColors[stat.color],
                }}
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.active !== undefined && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          {stat.active} Active
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    )}
                    {stat.pending !== undefined && stat.pending > 0 && (
                      <span className="px-2 py-1 text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        {stat.pending} Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">
                    {stat.title}
                  </h3>
                  <p className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                    {stat.count}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Eye className="w-3 h-3" />
                    <span>Click to manage</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Cards - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">Max Classes</h3>
            </div>
            <p className="text-3xl font-black mb-2">
              {courses.length > 0
                ? Math.max(...courses.map((c) => c.classes?.length || 0))
                : 0}
            </p>
            <p className="text-sm text-white/80">in a single course</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">Completed Orders</h3>
            </div>
            <p className="text-3xl font-black mb-2">{completedOrders}</p>
            <p className="text-sm text-white/80">Successfully delivered</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">Total Coupons</h3>
            </div>
            <p className="text-3xl font-black mb-2">{coupons.length}</p>
            <p className="text-sm text-white/80">Discount codes available</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
