import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchOrders,
  fetchOrderDetails,
  updateOrderStatus,
  clearCurrentOrder,
} from "../../store/slices/orderSlice";
import OrderDetailsModal from "../../components/modals/OrderDetailsModal";
import CustomDropdown from "../../components/common/CustomDropdown";
import SearchBar from "../../components/common/SearchBar";
import {
  Loader2,
  Package,
  Filter,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  TrendingDown,
  Zap,
  Award,
  Target,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const OrderManager = () => {
  const dispatch = useDispatch();

  // State
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Stores user input
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux
  const { items, currentOrder, loading, detailsLoading, pagination } =
    useSelector((state) => state.orders);

  // --- CALCULATE STATISTICS ---
  const statistics = useMemo(() => {
    const totalRevenue = items.reduce(
      (sum, order) => sum + (order.amount || 0),
      0,
    );
    const completedOrders = items.filter(
      (o) => o.status === "completed",
    ).length;
    const pendingOrders = items.filter((o) => o.status === "pending").length;
    const processingOrders = items.filter(
      (o) => o.status === "processing",
    ).length;
    const failedOrders = items.filter((o) => o.status === "failed").length;
    const cancelledOrders = items.filter(
      (o) => o.status === "cancelled",
    ).length;
    const avgOrderValue = items.length > 0 ? totalRevenue / items.length : 0;
    const totalCustomers = new Set(items.map((o) => o.user?._id)).size;

    return {
      totalRevenue,
      completedOrders,
      pendingOrders,
      processingOrders,
      failedOrders,
      cancelledOrders,
      avgOrderValue,
      totalOrders: items.length,
      totalCustomers,
      conversionRate:
        items.length > 0
          ? ((completedOrders / items.length) * 100).toFixed(1)
          : 0,
    };
  }, [items]);

  useEffect(() => {
    dispatch(
      fetchOrders({ page: 1, limit: 15, status: statusFilter || undefined }),
    );
  }, [dispatch, statusFilter]);

  // --- CLIENT-SIDE SEARCH LOGIC ---
  // Since the backend doesn't support 'search' param yet, we filter the loaded list.
  const filteredItems = items.filter((order) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.toLowerCase();
    const email = (order.user?.email || "").toLowerCase();
    const orderId = (order.orderId || "").toLowerCase();
    const dbId = (order._id || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      orderId.includes(searchLower) ||
      dbId.includes(searchLower)
    );
  });

  const handleViewDetails = (id) => {
    dispatch(fetchOrderDetails(id));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearCurrentOrder());
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to change the status to ${newStatus}?`,
      )
    ) {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
    }
  };

  const handleRefresh = () => {
    dispatch(
      fetchOrders({
        page: 1,
        limit: 15,
        status: statusFilter || undefined,
      }),
    );
  };

  // Helper: Export to CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      alert("No orders to export");
      return;
    }

    const csvData = filteredItems.map((order) => ({
      OrderID: order.orderId,
      Customer: `${order.user?.firstName} ${order.user?.lastName}`,
      Email: order.user?.email,
      Amount: order.amount,
      Status: order.status,
      Items: order.items?.length || 0,
      Date: new Date(order.createdAt).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Helper: Export to Excel
  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      alert("No orders to export");
      return;
    }

    const excelData = filteredItems.map((order) => {
      const itemsList =
        order.items
          ?.map(
            (item) =>
              `${item.itemDetails?.name || "Unknown"} (${item.itemType}) x${item.quantity}`,
          )
          .join("; ") || "No items";

      return {
        "Order ID": order.orderId,
        "Customer Name": `${order.user?.firstName} ${order.user?.lastName}`,
        Email: order.user?.email,
        Mobile: order.user?.mobileNumber || "N/A",
        "Amount (₹)": order.amount,
        Currency: order.currency || "INR",
        Status: order.status.toUpperCase(),
        Items: itemsList,
        "Item Count": order.items?.length || 0,
        "Payment ID": order.paymentId || "N/A",
        "Gateway Status": order.paymentDetails?.status || "N/A",
        "Created Date": new Date(order.createdAt).toLocaleDateString("en-GB"),
        "Created Time": new Date(order.createdAt).toLocaleTimeString("en-GB"),
      };
    });

    // Create HTML table for Excel
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4F46E5; color: white; font-weight: bold; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9fafb; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${Object.keys(excelData[0])
                .map((key) => `<th>${key}</th>`)
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${excelData
              .map(
                (row) => `
              <tr>
                ${Object.values(row)
                  .map((val) => `<td>${val}</td>`)
                  .join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper: Export to PDF
  const handleExportPDF = () => {
    if (filteredItems.length === 0) {
      alert("No orders to export");
      return;
    }

    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Orders Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4F46E5;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #64748b;
            margin: 5px 0;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          }
          .stat-card h3 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .stat-card p {
            margin: 5px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th {
            background-color: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          tr:hover {
            background-color: #f1f5f9;
          }
          .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-processing { background-color: #dbeafe; color: #1e40af; }
          .status-failed { background-color: #fee2e2; color: #991b1b; }
          .status-cancelled { background-color: #fee2e2; color: #991b1b; }
          .status-refunded { background-color: #f3e8ff; color: #6b21a8; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          @media print {
            body { margin: 0; }
            .stat-card { break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 Orders Report</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })} at ${new Date().toLocaleTimeString("en-GB")}</p>
          <p>Total Orders: <strong>${filteredItems.length}</strong></p>
        </div>

        <div class="stats">
          <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <h3>${formatCurrency(statistics.totalRevenue)}</h3>
            <p>TOTAL REVENUE</p>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
            <h3>${statistics.totalOrders}</h3>
            <p>TOTAL ORDERS</p>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
            <h3>${formatCurrency(statistics.avgOrderValue)}</h3>
            <p>AVG ORDER VALUE</p>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <h3>${statistics.totalCustomers}</h3>
            <p>UNIQUE CUSTOMERS</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Items</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredItems
              .map(
                (order) => `
              <tr>
                <td style="font-family: monospace; font-weight: bold;">${order.orderId}</td>
                <td>${order.user?.firstName} ${order.user?.lastName}</td>
                <td style="font-size: 10px;">${order.user?.email}</td>
                <td style="font-weight: bold;">${formatCurrency(order.amount)}</td>
                <td><span class="status status-${order.status}">${order.status}</span></td>
                <td style="text-align: center;">${order.items?.length || 0}</td>
                <td>${new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Brain Buzz Admin Panel</strong> - Order Management System</p>
          <p>This report contains ${filteredItems.length} orders</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Helper: Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper Components
  const StatusBadge = ({ status }) => {
    const config = {
      completed: {
        bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle,
        border: "border-green-200 dark:border-green-700",
        dot: "bg-green-600",
      },
      pending: {
        bg: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900",
        text: "text-amber-700 dark:text-amber-400",
        icon: Clock,
        border: "border-amber-200 dark:border-amber-700",
        dot: "bg-amber-600",
      },
      processing: {
        bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900",
        text: "text-blue-700 dark:text-blue-400",
        icon: Activity,
        border: "border-blue-200 dark:border-blue-700",
        dot: "bg-blue-600 animate-pulse",
      },
      failed: {
        bg: "bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900 dark:to-red-900",
        text: "text-rose-700 dark:text-rose-400",
        icon: XCircle,
        border: "border-rose-200 dark:border-rose-700",
        dot: "bg-rose-600",
      },
      cancelled: {
        bg: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900",
        text: "text-red-700 dark:text-red-400",
        icon: XCircle,
        border: "border-red-200 dark:border-red-700",
        dot: "bg-red-600",
      },
      refunded: {
        bg: "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900 dark:to-violet-900",
        text: "text-purple-700 dark:text-purple-400",
        icon: AlertCircle,
        border: "border-purple-200 dark:border-purple-700",
        dot: "bg-purple-600",
      },
    };

    const style = config[status] || {
      bg: "bg-slate-50 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      icon: Clock,
      border: "border-slate-200 dark:border-slate-700",
      dot: "bg-slate-400",
    };
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-2 shadow-sm ${style.bg} ${style.text} ${style.border}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <Icon size={14} strokeWidth={2.5} />
        {status}
      </span>
    );
  };

  const filterOptions = [
    { value: "", label: "All Statuses", icon: Filter },
    { value: "completed", label: "Completed", icon: CheckCircle },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "processing", label: "Processing", icon: Activity },
    { value: "failed", label: "Failed", icon: XCircle },
    { value: "cancelled", label: "Cancelled", icon: XCircle },
    { value: "refunded", label: "Refunded", icon: AlertCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 w-full min-h-screen space-y-6"
    >
      {/* ================= HERO HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30"
            >
              <ShoppingBag className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Order Management
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </h1>
              <p className="text-white/90 font-medium mt-1 flex items-center gap-2">
                <TrendingUp size={16} />
                Complete overview of all transactions and order management
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl transition-all border-2 border-white/30 flex items-center gap-2 shadow-lg"
            >
              <RotateCcw size={18} />
              Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportExcel}
              className="px-6 py-3 bg-white hover:bg-white/90 text-green-600 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg border-2 border-green-500/20"
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="px-6 py-3 bg-white hover:bg-white/90 text-red-600 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg border-2 border-red-500/20"
            >
              <FileText size={18} />
              Export PDF
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ================= STATISTICS DASHBOARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Revenue */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl border-2 border-green-400/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-bold uppercase tracking-wider mb-1">
              Total Revenue
            </h3>
            <p className="text-4xl font-black text-white">
              {formatCurrency(statistics.totalRevenue)}
            </p>
            <p className="text-white/70 text-xs mt-2 font-medium">
              From {statistics.totalOrders} orders
            </p>
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl border-2 border-blue-400/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-bold uppercase tracking-wider mb-1">
              Total Orders
            </h3>
            <p className="text-4xl font-black text-white">
              {statistics.totalOrders}
            </p>
            <p className="text-white/70 text-xs mt-2 font-medium">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
        </motion.div>

        {/* Average Order Value */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-xl border-2 border-purple-400/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-bold uppercase tracking-wider mb-1">
              Avg Order Value
            </h3>
            <p className="text-4xl font-black text-white">
              {formatCurrency(statistics.avgOrderValue)}
            </p>
            <p className="text-white/70 text-xs mt-2 font-medium">
              Per transaction
            </p>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-xl border-2 border-orange-400/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/90 text-sm font-bold uppercase tracking-wider mb-1">
              Total Customers
            </h3>
            <p className="text-4xl font-black text-white">
              {statistics.totalCustomers}
            </p>
            <p className="text-white/70 text-xs mt-2 font-medium">
              Unique buyers
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ================= STATUS OVERVIEW ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {statistics.completedOrders}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase">
            Completed
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {statistics.pendingOrders}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase">Pending</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {statistics.processingOrders}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase">
            Processing
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 rounded-lg">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {statistics.failedOrders}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase">Failed</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {statistics.cancelledOrders}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase">
            Cancelled
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              {items.filter((o) => o.status === "refunded").length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase">Refunded</p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Status Filter */}
          <div className="w-full lg:w-64">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              Filter by Status
            </label>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={filterOptions}
              placeholder="All Statuses"
              icon={Filter}
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              Search Orders
            </label>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by Name, Email or Order ID..."
            />
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border border-indigo-200">
              <p className="text-[10px] font-bold text-indigo-600 uppercase">
                Showing
              </p>
              <p className="text-lg font-black text-indigo-900">
                {filteredItems.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-indigo-600" />
            </motion.div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 animate-pulse">
              Fetching orders...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  <AnimatePresence>
                    {filteredItems.map((order, idx) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300"
                      >
                        {/* ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="p-2.5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl shadow-sm group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors"
                            >
                              <Package
                                size={18}
                                className="text-indigo-500 dark:text-indigo-400"
                              />
                            </motion.div>
                            <div>
                              <span className="block font-mono text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg w-fit mb-1 shadow-sm">
                                #
                                {order.orderId ||
                                  order._id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wide">
                                {order.items?.length || 0} Items
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {order.user?.email}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <span className="font-black text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{order.amount.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-slate-600 dark:text-slate-300 font-semibold">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewDetails(order._id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
                          >
                            Details <ArrowUpRight size={14} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t-2 border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Showing Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    dispatch(
                      fetchOrders({
                        page: pagination.page - 1,
                        limit: 15,
                        status: statusFilter,
                      }),
                    )
                  }
                  className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900 dark:hover:to-purple-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center gap-1 shadow-sm"
                >
                  <ChevronLeft size={14} /> Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    dispatch(
                      fetchOrders({
                        page: pagination.page + 1,
                        limit: 15,
                        status: statusFilter,
                      }),
                    )
                  }
                  className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900 dark:hover:to-purple-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center gap-1 shadow-sm"
                >
                  Next <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-32 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg"
            >
              <Package
                size={40}
                className="text-indigo-400 dark:text-indigo-500"
              />
            </motion.div>
            <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-2">
              No Orders Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-6">
              {searchTerm
                ? `No orders found matching "${searchTerm}".`
                : "We couldn't find any orders matching your current filters."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatusFilter("");
                setSearchTerm("");
                handleRefresh();
              }}
              className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={currentOrder}
        onStatusUpdate={handleStatusUpdate}
        loading={detailsLoading}
      />
    </motion.div>
  );
};

export default OrderManager;
