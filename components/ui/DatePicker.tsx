"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  align?: "left" | "right";
  size?: "sm" | "md";
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  label,
  align = "left",
  size = "md",
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewDate(d);
      }
    }
  }, [value]);

  // Handle clicking outside to close
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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0 to 11

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Calculate calendar days
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const formatted = `${year}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const yearStr = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, "0");
    const dayStr = String(now.getDate()).padStart(2, "0");
    const formatted = `${yearStr}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setViewDate(now);
    setIsOpen(false);
  };

  // Check today
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  // Check selected
  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split("-");
    if (parts.length !== 3) return false;
    return (
      parseInt(parts[0] || "0", 10) === year &&
      parseInt(parts[1] || "0", 10) === month + 1 &&
      parseInt(parts[2] || "0", 10) === day
    );
  };

  const displayDateText = () => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parseInt(parts[1] || "1", 10) - 1;
      const d = parseInt(parts[2] || "1", 10);
      return `${d} ${monthNames[m]} ${y}`;
    }
    return value;
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
            {displayDateText() || placeholder}
          </span>
        </div>
        {value && (
          <span
            onClick={handleClear}
            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 ml-1 shrink-0"
            title="Clear date"
          >
            <X className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
          </span>
        )}
      </button>

      {/* Compact Popover Calendar */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 p-2.5 w-56 animate-in fade-in zoom-in-95 duration-100 max-w-[calc(100vw-24px)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-0.5 text-center my-1.5">
            {daysOfWeek.map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {/* Empty slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6 w-6" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const todayDay = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-6 w-6 mx-auto flex items-center justify-center rounded-md text-[11px] font-medium transition-colors",
                    selected
                      ? "bg-purple-600 text-white font-bold shadow-2xs"
                      : todayDay
                      ? "bg-purple-50 text-purple-700 font-bold hover:bg-purple-100"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-100 text-[10px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 font-medium px-1 py-0.5 rounded"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-purple-600 hover:text-purple-700 font-bold px-1 py-0.5 rounded"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

