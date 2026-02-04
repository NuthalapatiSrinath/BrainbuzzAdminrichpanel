import React from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative group min-w-[280px] ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl leading-5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        placeholder={placeholder}
      />

      {/* Clear Button (Visible only when text exists) */}
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <div className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <X className="w-4 h-4" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
