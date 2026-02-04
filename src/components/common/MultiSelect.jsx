import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

const MultiSelect = ({
  label,
  options = [],
  value = [], // Array of selected IDs
  onChange,
  placeholder = "Select...",
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer transition-all ${
          disabled
            ? "bg-slate-50 cursor-not-allowed"
            : isOpen
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {Icon && <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
          {value.length === 0 ? (
            <span className="text-slate-400 text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => {
                      const optValue = options.find(
                        (o) => o.label === label,
                      )?.value;
                      if (optValue) handleRemove(optValue, e);
                    }}
                    className="hover:bg-indigo-100 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
