import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Languages,
  Loader2,
  Globe,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import ActionButton from "../../components/common/ActionButton";
import CustomDropdown from "../../components/common/CustomDropdown";

// Actions
import {
  fetchLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "../../store/slices/languageSlice";

const LanguageManager = () => {
  const dispatch = useDispatch();
  const { items: languages, loading } = useSelector((state) => state.languages);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchLanguages());
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
      await dispatch(createLanguage(data)).unwrap();
      toast.success("Language added successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to create language",
      );
    }
  };

  const handleUpdate = async (data) => {
    try {
      await dispatch(updateLanguage({ id: selectedItem._id, data })).unwrap();
      toast.success("Language updated successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Failed to update language");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this language?")) {
      try {
        await dispatch(deleteLanguage(id)).unwrap();
        toast.success("Language deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  // --- FILTERS ---
  const filteredData = useMemo(() => {
    let filtered = languages;

    // Filter by search (name or code) - trim and case-insensitive
    if (search) {
      const searchTerm = search.trim().toLowerCase();
      if (searchTerm) {
        filtered = filtered.filter((item) => {
          return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.code?.toLowerCase().includes(searchTerm)
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
  }, [languages, search, statusFilter]);

  // --- COLUMNS ---
  const columns = [
    {
      header: "Language",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase text-sm shadow-sm">
            {row.code || row.name.substring(0, 2)}
          </div>
          <span className="font-bold text-slate-800 dark:text-white">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      header: "Code",
      accessor: "code",
      render: (row) => (
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 px-4 py-2 rounded-xl w-fit shadow-sm border border-slate-200 dark:border-slate-600 font-mono">
          <Globe className="w-4 h-4 text-indigo-500" />
          {row.code || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-4 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm ${
            row.isActive
              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-400"
              : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900 dark:to-rose-900 dark:text-red-400"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              row.isActive ? "bg-green-600 animate-pulse" : "bg-red-600"
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
            className="p-2.5 text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900 dark:hover:to-indigo-900 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(row._id)}
            className="p-2.5 text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900 dark:hover:to-rose-900 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-800"
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
      name: "name",
      label: "Language Name",
      type: "text",
      required: true,
      placeholder: "e.g. English",
    },
    {
      name: "code",
      label: "Language Code",
      type: "text",
      placeholder: "e.g. en",
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
              <Languages className="w-7 h-7 text-white" />
            </div>
            Language Management
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 dark:text-slate-400 text-sm"
          >
            Manage supported languages for multilingual content.
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

          {/* Search Bar */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search languages..."
          />

          <ActionButton
            onClick={openCreateModal}
            icon={Plus}
            variant="primary"
            size="md"
          >
            Add Language
          </ActionButton>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {loading ? (
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
              Loading languages...
            </motion.p>
          </motion.div>
        ) : filteredData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Languages className="w-16 h-16 mb-4 opacity-30" />
            </motion.div>
            <p className="text-lg font-semibold mb-2">No languages found</p>
            <p className="text-sm">
              {search
                ? "Try adjusting your search"
                : "Get started by adding a new language"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <DataTable
              columns={columns}
              data={filteredData}
              hideSearch={true}
            />
          </motion.div>
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
            title={selectedItem ? "Edit Language" : "Add Language"}
            fields={modalFields}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LanguageManager;
