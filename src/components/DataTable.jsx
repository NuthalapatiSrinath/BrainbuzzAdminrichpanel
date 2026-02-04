import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Inbox,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Compact Pagination Dropdown Component using Portals
const PaginationDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Calculate position when opening
  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4, // 4px gap below button
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  // Handle window resize to close dropdown if open (prevents floating issues)
  useEffect(() => {
    const handleResize = () => setIsOpen(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all shadow-sm hover:shadow-md"
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* PORTAL: Renders this outside the table DOM, directly into body */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-start justify-start">
            {/* Invisible backdrop to handle click-outside */}
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: coords.top,
                    left: coords.left,
                    minWidth: "80px", // Ensure it's not too thin
                  }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden"
                >
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-between whitespace-nowrap ${
                        value === option
                          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{option}</span>
                      {value === option && <Check className="w-4 h-4 ml-2" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body, // Target container
        )}
    </div>
  );
};

const DataTable = ({
  title = "Data List",
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSearch,
  hideSearch = false,
  actionButton,
  renderExpandedRow,
}) => {
  const isServer = !!(pagination && onPageChange);

  const [localPage, setLocalPage] = useState(1);
  const [localLimit, setLocalLimit] = useState(20);
  const [localSearch, setLocalSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    if (isServer && onSearch) onSearch(value);
    else {
      setLocalSearch(value);
      setLocalPage(1);
    }
  };

  useEffect(() => {
    setLocalPage(1);
  }, [data]);

  const processed = useMemo(() => {
    if (!isServer && localSearch) {
      return data.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(localSearch.toLowerCase()),
        ),
      );
    }
    return data;
  }, [data, localSearch, isServer]);

  const limit = isServer ? pagination?.limit || 20 : localLimit;
  const page = isServer ? pagination?.page || 1 : localPage;
  const total = isServer ? pagination?.total || 0 : processed.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const rows = isServer
    ? data
    : processed.slice((page - 1) * limit, page * limit);

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    if (isServer) onPageChange(p);
    else setLocalPage(p);
  };

  const changeLimit = (l) => {
    if (isServer && onLimitChange) onLimitChange(l);
    else {
      setLocalLimit(l);
      setLocalPage(1);
    }
  };

  const pages = (() => {
    const list = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else if (page <= 3) list.push(1, 2, 3, 4, "...", totalPages);
    else if (page >= totalPages - 2)
      list.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    else list.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return list;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden" // Main container hidden
    >
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4 flex-shrink-0 bg-white dark:bg-slate-800 z-20">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Found{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {total}
            </span>{" "}
            records
          </p>
        </div>

        <div className="flex gap-3 items-center w-full sm:w-auto">
          {!hideSearch && (
            <div className="relative flex-1 sm:flex-none group">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                placeholder="Search..."
                defaultValue={isServer ? "" : localSearch}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm w-full sm:w-[260px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white shadow-sm"
              />
            </div>
          )}
          {actionButton}
        </div>
      </div>

      {/* TABLE AREA CONTAINER */}
      <div className="flex-1 relative w-full overflow-hidden flex flex-col bg-white dark:bg-slate-800">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 p-8 rounded-2xl shadow-2xl border-2 border-indigo-100 dark:border-indigo-800 flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Loading Data...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE TABLE WRAPPER */}
        <div className="flex-1 w-full overflow-auto custom-scrollbar">
          <table className="min-w-full whitespace-nowrap text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 backdrop-blur-md z-10 shadow-sm border-b-2 border-slate-200 dark:border-slate-700">
              <tr>
                {columns.map((c, i) => (
                  <th
                    key={i}
                    className={`px-5 py-4 text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 tracking-wider ${
                      c.className || ""
                    }`}
                  >
                    {c.header}
                  </th>
                ))}
                {renderExpandedRow && (
                  <th className="w-10 px-5 bg-transparent" />
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
                    className="py-32 text-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                      >
                        <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        No Data Found
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                        We couldn't find any records matching your search or
                        filters.
                      </p>
                    </motion.div>
                  </td>
                </tr>
              )}

              {rows.map((row, i) => {
                const id = row._id || row.id || i;
                const expanded = expandedRows.includes(id);

                return (
                  <React.Fragment key={id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/10 ${
                        expanded ? "bg-indigo-50/30 dark:bg-indigo-900/20" : ""
                      }`}
                    >
                      {columns.map((c, j) => (
                        <td
                          key={j}
                          className={`px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-800 ${
                            c.className || ""
                          }`}
                        >
                          {c.render ? c.render(row, i) : row[c.accessor]}
                        </td>
                      ))}

                      {renderExpandedRow && (
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              setExpandedRows(
                                expanded
                                  ? expandedRows.filter((x) => x !== id)
                                  : [...expandedRows, id],
                              )
                            }
                            className={`p-2 rounded-lg transition-all ${
                              expanded
                                ? "bg-indigo-100 text-indigo-600"
                                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            {expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                    </motion.tr>

                    {expanded && renderExpandedRow && (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="p-0 border-b border-slate-100"
                        >
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gradient-to-br from-indigo-50/30 to-purple-50/20 dark:from-indigo-900/10 dark:to-purple-900/5 overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-lg">
                                {renderExpandedRow(row)}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-3 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Rows per page:
          </span>
          <PaginationDropdown
            value={limit}
            onChange={(val) => changeLimit(val)}
            options={[20, 50, 100]}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={page === 1 || loading}
            onClick={() => changePage(page - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900 dark:hover:to-purple-900 hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500 dark:text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="hidden sm:flex gap-1 px-2">
            {pages.map((p, i) => (
              <motion.button
                key={i}
                whileHover={p !== "..." ? { scale: 1.15, y: -2 } : {}}
                whileTap={p !== "..." ? { scale: 0.95 } : {}}
                disabled={p === "..." || loading}
                onClick={() => typeof p === "number" && changePage(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  p === page
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300 dark:shadow-indigo-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900 dark:hover:to-purple-900 hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400"
                } ${
                  p === "..."
                    ? "hover:bg-transparent hover:shadow-none cursor-default"
                    : ""
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>

          <span className="sm:hidden text-sm font-bold text-slate-700 dark:text-slate-300 px-4">
            {page} / {totalPages}
          </span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={page === totalPages || loading}
            onClick={() => changePage(page + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900 dark:hover:to-purple-900 hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500 dark:text-slate-400"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DataTable;
