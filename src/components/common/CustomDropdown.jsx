import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

const CustomDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  icon: Icon,
  searchable = false,
  error,
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 outline-none
            ${
              error
                ? "border-red-300 bg-red-50 text-red-900"
                : isOpen
                  ? "border-indigo-500 ring-4 ring-indigo-50 bg-white shadow-md transform -translate-y-0.5"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
            }
            ${
              disabled
                ? "opacity-60 cursor-not-allowed bg-slate-100"
                : "cursor-pointer"
            }
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {Icon && (
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  error ? "text-red-400" : "text-slate-400"
                }`}
              />
            )}
            <span
              className={`block truncate text-sm font-semibold ${
                selectedOption ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-indigo-500" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
            {searchable && (
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <ul className="max-h-80 overflow-auto py-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      relative cursor-pointer select-none py-2.5 pl-4 pr-10 text-sm transition-colors
                      ${
                        opt.value === value
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {opt.icon && (
                        <opt.icon className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="block truncate">{opt.label}</span>
                    </div>
                    {opt.value === value && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  No options found
                </div>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default CustomDropdown;
