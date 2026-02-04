import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const DatePicker = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  name,
  minDate,
  maxDate,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef(null);

  // Parse the value to Date object
  const selectedDate = value ? new Date(value) : null;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Initialize current month based on selected date or today
  useEffect(() => {
    if (selectedDate && isOpen) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [isOpen]);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (!date) return;

    // Check if date is disabled
    if (isDateDisabled(date)) return;

    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
    onChange({
      target: {
        name,
        value: formattedDate,
      },
    });
    setIsOpen(false);
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (!date) return true;
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (minDate) {
      const min = new Date(minDate);
      const minOnly = new Date(
        min.getFullYear(),
        min.getMonth(),
        min.getDate(),
      );
      if (dateOnly < minOnly) return true;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      const maxOnly = new Date(
        max.getFullYear(),
        max.getMonth(),
        max.getDate(),
      );
      if (dateOnly > maxOnly) return true;
    }

    return false;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Clear selection
  const clearDate = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: "",
      },
    });
  };

  // Quick select today
  const selectToday = () => {
    const today = new Date();
    if (!isDateDisabled(today)) {
      handleDateSelect(today);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      {/* Input Trigger */}
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
        <input
          type="text"
          readOnly
          value={formatDate(selectedDate)}
          placeholder={placeholder}
          className={`w-full pl-11 pr-10 py-3 border-2 rounded-xl font-medium transition-all cursor-pointer
            ${
              error
                ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                : isOpen
                  ? "border-indigo-500 dark:border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900"
                  : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500"
            }
            bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
            focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          disabled={disabled}
        />
        {value && !disabled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearDate}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </motion.button>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium"
        >
          {error}
        </motion.p>
      )}

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-[300px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3">
              <div className="flex items-center justify-between mb-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevMonth}
                  type="button"
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} className="text-white" />
                </motion.button>
                <h3 className="text-white font-bold text-base">{monthName}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextMonth}
                  type="button"
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} className="text-white" />
                </motion.button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={selectToday}
                  type="button"
                  className="flex-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold transition-colors"
                >
                  Today
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearDate}
                  type="button"
                  className="flex-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold transition-colors"
                >
                  Clear
                </motion.button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, idx) => {
                  const disabled = isDateDisabled(date);
                  const selected = isDateSelected(date);
                  const today = isToday(date);

                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={
                        date && !disabled ? { scale: 1.1 } : undefined
                      }
                      whileTap={date && !disabled ? { scale: 0.9 } : undefined}
                      onClick={() => handleDateSelect(date)}
                      disabled={!date || disabled}
                      className={`
                        aspect-square rounded-lg text-xs font-semibold transition-all relative
                        ${!date ? "invisible" : ""}
                        ${
                          selected
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                            : disabled
                              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                              : today
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold border-2 border-indigo-300 dark:border-indigo-700"
                                : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700"
                        }
                      `}
                    >
                      {date?.getDate()}
                      {today && !selected && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
