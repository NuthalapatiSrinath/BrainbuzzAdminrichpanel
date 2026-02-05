import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Loader2,
  Calendar,
  Search,
  Sparkles,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Components
import DataTable from "../../components/DataTable";
import GenericModal from "../../components/modals/GenericModal";
import CustomDropdown from "../../components/common/CustomDropdown";

// Actions
import {
  fetchValidities,
  createValidity,
  updateValidity,
  deleteValidity,
} from "../../store/slices/validitySlice";

const ValidityManager = () => {
  const dispatch = useDispatch();
  const { items: validities, loading } = useSelector(
    (state) => state.validities,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchValidities());
  }, [dispatch]);

  // --- HANDLERS ---
  const openCreateModal = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCreate = async (data) => {
    try {
      await dispatch(createValidity(data)).unwrap();
      toast.success("Validity option created successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to create validity",
      );
    }
  };

  const handleUpdate = async (data) => {
    try {
      await dispatch(updateValidity({ id: selectedItem._id, data })).unwrap();
      toast.success("Validity updated successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Failed to update validity");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this option?")) {
      try {
        await dispatch(deleteValidity(id)).unwrap();
        toast.success("Validity deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  // --- FILTERS ---
  const filteredData = useMemo(() => {
    let filtered = validities;

    // Filter by search
    if (search) {
      const searchTerm = search.trim().toLowerCase().replace(/\s+/g, "");
      if (searchTerm) {
        filtered = filtered.filter((item) => {
          const labelNormalized = item.label.toLowerCase().replace(/\s+/g, "");
          const durationNormalized = item.durationInDays.toString();
          const durationWithDays = `${item.durationInDays}days`.toLowerCase();
          return (
            labelNormalized.includes(searchTerm) ||
            durationNormalized.includes(searchTerm) ||
            durationWithDays.includes(searchTerm)
          );
        });
      }
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "active") return item.isActive === true;
        if (statusFilter === "inactive") return item.isActive === false;
        return true;
      });
    }

    return filtered;
  }, [validities, search, statusFilter]);

  // --- COLUMNS ---
  const columns = [
    {
      header: "Label",
      accessor: "label",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-700">
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            {row.label}
          </span>
        </div>
      ),
    },
    {
      header: "Duration (Days)",
      accessor: "durationInDays",
      render: (row) => (
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 px-4 py-2 rounded-xl w-fit shadow-sm border border-slate-200 dark:border-slate-600">
          <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          {row.durationInDays} Days
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-4 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm border ${
            row.isActive
              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-400 dark:border-green-700"
              : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200 dark:from-red-900/50 dark:to-rose-900/50 dark:text-red-400 dark:border-red-700"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              row.isActive
                ? "bg-green-600 dark:bg-green-400 animate-pulse"
                : "bg-red-600 dark:bg-red-400"
            }`}
          />
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openEditModal(row)}
            className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(row._id)}
            className="p-2.5 text-red-600 dark:text-red-400 hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/50 dark:hover:to-rose-900/50 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-700"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  // --- MODAL CONFIG ---
  const modalFields = [
    {
      name: "label",
      label: "Label",
      type: "text",
      required: true,
      placeholder: "e.g. 6 Months",
    },
    {
      name: "durationInDays",
      label: "Duration (in Days)",
      type: "number",
      required: true,
      placeholder: "e.g. 180",
    },
    {
      name: "isActive",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
      required: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ✨ HERO HEADER (Like Test Series Page) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 shadow-2xl"
      >
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
            >
              <Clock className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg flex items-center gap-3">
                Validity Options
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-white/90 text-lg mt-2">
                Manage course duration options and settings
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Option
          </motion.button>
        </div>
      </motion.div>

      {/* 🔍 SEARCH & FILTER SECTION (New Card) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Filter className="w-5 h-5" />
            </div>
            <div className="w-full md:w-64">
              <CustomDropdown
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                placeholder="Filter by status"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search validity options..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none font-medium text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </motion.div>

      {/* 📋 CONTENT SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-indigo-600" />
            </motion.div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
              Loading data...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
              No options found
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or add a new option.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            hideSearch={true} // We use our custom search bar above
          />
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <GenericModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={selectedItem ? handleUpdate : handleCreate}
            initialData={selectedItem}
            title={selectedItem ? "Edit Validity" : "Add Validity"}
            fields={modalFields}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValidityManager;
