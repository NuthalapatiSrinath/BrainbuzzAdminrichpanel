import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchCoupons,
  toggleCouponStatus,
  deleteCoupon,
} from "../../store/slices/couponSlice";
import CouponModal from "../../components/modals/CouponModal";
import SearchBar from "../../components/common/SearchBar";
import ActionButton from "../../components/common/ActionButton";
import CustomDropdown from "../../components/common/CustomDropdown";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Percent,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const CouponManager = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [search, setSearch] = useState("");

  // Local state for basic filtering (if needed, or pass params to fetch)
  const [filterActive, setFilterActive] = useState("all"); // 'all', 'active', 'inactive'

  const { items, loading, pagination } = useSelector((state) => state.coupons);

  useEffect(() => {
    // Fetch coupons based on filter
    const params = { page: 1, limit: 20 };
    if (filterActive !== "all") {
      params.isActive = filterActive === "active";
    }
    dispatch(fetchCoupons(params));
  }, [dispatch, filterActive]);

  // Filter coupons by search
  const filteredCoupons = items.filter((coupon) => {
    if (!search) return true;
    const searchTerm = search.toLowerCase().trim();
    return (
      coupon.code.toLowerCase().includes(searchTerm) ||
      coupon.description?.toLowerCase().includes(searchTerm)
    );
  });

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      confirm(
        "Are you sure you want to delete this coupon? This cannot be undone.",
      )
    ) {
      dispatch(deleteCoupon(id));
    }
  };

  const handleToggle = (id) => {
    dispatch(toggleCouponStatus(id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 space-y-6 md:space-y-8 w-full"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6"
      >
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Tag className="w-7 h-7 text-white" />
            </div>
            Coupon Manager
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 dark:text-slate-400 text-sm"
          >
            Create and manage discount codes with precision.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
        >
          {/* Status Filter Dropdown */}
          <div className="min-w-[160px]">
            <CustomDropdown
              value={filterActive}
              onChange={(val) => setFilterActive(val)}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              placeholder="Filter by status"
            />
          </div>

          {/* Search Bar */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search coupons..."
          />

          <ActionButton
            onClick={handleOpenCreate}
            icon={Plus}
            variant="primary"
            size="md"
          >
            Create Coupon
          </ActionButton>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {loading && items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center h-64 text-indigo-500"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Loading coupons...
            </motion.p>
          </motion.div>
        ) : filteredCoupons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Tag className="w-16 h-16 mb-4 opacity-30" />
            </motion.div>
            <p className="text-lg font-semibold mb-2">No coupons found</p>
            <p className="text-sm">
              {search
                ? "Try adjusting your search"
                : "Get started by creating a new coupon"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredCoupons.map((coupon, idx) => (
                <motion.div
                  key={coupon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        coupon.isActive
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                      }`}
                    >
                      {coupon.discountType === "percentage" ? (
                        <Percent size={24} />
                      ) : (
                        <span className="text-xl font-bold">₹</span>
                      )}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-wide font-mono">
                          {coupon.code}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm ${
                            coupon.isActive
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-400"
                              : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-500 dark:from-slate-700 dark:to-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              coupon.isActive
                                ? "bg-green-600 animate-pulse"
                                : "bg-slate-400"
                            }`}
                          />
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
                        {coupon.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg">
                          <CalendarDays size={12} className="text-indigo-500" />
                          Expires:{" "}
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg">
                          <TrendingUp size={12} className="text-purple-500" />
                          {coupon.usedCount} used
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Value */}
                  <div className="text-center min-w-[120px]">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="block text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    >
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </motion.span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      OFF
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggle(coupon._id)}
                      title={coupon.isActive ? "Deactivate" : "Activate"}
                      className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md ${
                        coupon.isActive
                          ? "text-green-600 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900 dark:hover:to-emerald-900"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {coupon.isActive ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(coupon)}
                      className="p-2.5 text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900 dark:hover:to-indigo-900 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2.5 text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900 dark:hover:to-rose-900 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-800"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CouponModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            editData={editingCoupon}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CouponManager;
