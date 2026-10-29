"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface MonthPickerProps {
  value?: string; // YYYY-MM format (e.g. "2026-10")
  onChange: (monthStr: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  align?: "left" | "right";
  required?: boolean;
  size?: "sm" | "md";
}

export const MonthPicker = ({
  value,
  onChange,
  placeholder = "Select month",
  className,
  label,
  align = "right",
  size = "md",
}: MonthPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const fullMonthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Parse initial year from value
  const parseYearFromValue = () => {
    if (value && value.includes("-")) {
      const y = parseInt(value.split("-")[0], 10);
      if (!isNaN(y)) return y;
    }
    return new Date().getFullYear();
  };

  const [viewYear, setViewYear] = useState<number>(parseYearFromValue);

  useEffect(() => {
    if (value && value.includes("-")) {
      const y = parseInt(value.split("-")[0], 10);
      if (!isNaN(y)) {
        setViewYear(y);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewYear((prev) => prev + 1);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    onChange(`${viewYear}-${monthStr}`);
    setIsOpen(false);
  };

  const handleCurrentMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setViewYear(y);
    onChange(`${y}-${m}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const displayMonthText = () => {
    if (!value || !value.includes("-")) return "";
    const parts = value.split("-");
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    if (m >= 0 && m < 12) {
      return `${monthNames[m]} ${y}`;
    }
    return value;
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  const isSelected = (monthIndex: number) => {
    if (!value || !value.includes("-")) return false;
    const parts = value.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === viewYear && m === monthIndex;
  };

  const isCurrentMonth = (monthIndex: number) => {
    return viewYear === currentYear && monthIndex === currentMonthIdx;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between border border-slate-300 bg-white text-slate-700 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors shadow-2xs text-left",
          size === "sm"
            ? "px-2 py-0.5 sm:py-1 text-[11px] h-7 rounded-md"
            : "px-2.5 py-1.5 text-xs rounded-lg",
          className
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5", "text-purple-600 shrink-0")} />
          <span className={value ? "text-slate-900 font-medium truncate" : "text-slate-400 truncate"}>
            {displayMonthText() || placeholder}
          </span>
        </div>
        {value && (
          <span
            onClick={handleClear}
            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 ml-1 shrink-0"
            title="Clear"
          >
            <X className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 w-52 animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0",
            // Safety measure so it never spills on small viewports
            "max-w-[calc(100vw-24px)]"
          )}
        >
          {/* Header with year switch */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-800">{viewYear}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevYear}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
                title="Previous year"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextYear}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
                title="Next year"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4x3 Month Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {monthNames.map((name, idx) => {
              const selected = isSelected(idx);
              const isCurr = isCurrentMonth(idx);

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={cn(
                    "py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center",
                    selected
                      ? "bg-purple-600 text-white font-semibold shadow-xs"
                      : isCurr
                      ? "bg-purple-50 text-purple-700 font-semibold border border-purple-200 hover:bg-purple-100"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

