"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface DateRangePickerProps {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  onChange: (range: { startDate: string; endDate: string }) => void;
  placeholder?: string;
  className?: string;
}

export const DateRangePicker = ({
  startDate = "",
  endDate = "",
  onChange,
  placeholder = "Filter by date range",
  className,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 'start' means next click selects startDate; 'end' means next click selects endDate
  const [step, setStep] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Month navigation
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  useEffect(() => {
    setTempStart(startDate);
  }, [startDate]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setStep("start");
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

  const formatDateString = (y: number, m: number, d: number) => {
    const monthStr = String(m + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    return `${y}-${monthStr}-${dayStr}`;
  };

  const handleDayClick = (day: number) => {
    const clickedDate = formatDateString(year, month, day);

    if (step === "start") {
      setTempStart(clickedDate);
      setStep("end");
    } else {
      // Step === 'end'
      if (clickedDate < tempStart) {
        // If clicked date is before start date, treat clicked as new start date
        setTempStart(clickedDate);
        setStep("end");
      } else {
        onChange({ startDate: tempStart, endDate: clickedDate });
        setIsOpen(false);
        setStep("start");
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempStart("");
    onChange({ startDate: "", endDate: "" });
    setStep("start");
    setIsOpen(false);
  };

  const handleTodayOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const todayStr = formatDateString(now.getFullYear(), now.getMonth(), now.getDate());
    onChange({ startDate: todayStr, endDate: todayStr });
    setViewDate(now);
    setIsOpen(false);
    setStep("start");
  };

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      const m = parseInt(parts[1] || "1", 10) - 1;
      const d = parseInt(parts[2] || "1", 10);
      return `${d} ${monthNames[m]}`;
    }
    return dStr;
  };

  // Check state of each day
  const isDayStart = (dateStr: string) =>
    step === "end" ? dateStr === tempStart : dateStr === startDate;

  const isDayEnd = (dateStr: string) =>
    step === "start" && dateStr === endDate;

  const isDayInRange = (dateStr: string) => {
    if (step === "end" && tempStart) {
      const maxDate = hoveredDate && hoveredDate > tempStart ? hoveredDate : tempStart;
      return dateStr > tempStart && dateStr < maxDate;
    }
    if (startDate && endDate) {
      return dateStr > startDate && dateStr < endDate;
    }
    return false;
  };

  const displayButtonText = () => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return formatDisplayDate(startDate);
      }
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate && !endDate) {
      return `From ${formatDisplayDate(startDate)}`;
    }
    return "";
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setStep("start");
          setTempStart(startDate);
        }}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors shadow-2xs text-left",
          className
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span
            className={
              startDate || endDate
                ? "text-slate-900 font-medium truncate text-[11px]"
                : "text-slate-400 truncate text-[11px]"
            }
          >
            {displayButtonText() || placeholder}
          </span>
        </div>

        {(startDate || endDate) && (
          <span
            onClick={handleClear}
            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 ml-1 shrink-0"
            title="Clear date range"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 sm:left-auto sm:right-0 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-64 max-w-[calc(100vw-24px)] animate-in fade-in zoom-in-95 duration-100">
          {/* Step guidance banner */}
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-purple-800 font-semibold">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                {step === "start" ? "1" : "2"}
              </span>
              <span>{step === "start" ? "Pick Start date" : "Now pick End date"}</span>
            </div>
            {step === "end" && tempStart && (
              <span className="text-[10px] text-purple-600 font-medium">
                From: {formatDisplayDate(tempStart)}
              </span>
            )}
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
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

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-0 text-center my-1.5">
            {daysOfWeek.map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateString(year, month, day);

              const isStart = isDayStart(dateStr);
              const isEnd = isDayEnd(dateStr);
              const inRange = isDayInRange(dateStr);

              return (
                <button
                  key={day}
                  type="button"
                  onMouseEnter={() => {
                    if (step === "end") setHoveredDate(dateStr);
                  }}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-6 w-full flex items-center justify-center text-[11px] font-medium transition-colors",
                    isStart && !isEnd
                      ? "bg-purple-600 text-white font-bold rounded-l-md"
                      : isEnd && !isStart
                      ? "bg-purple-600 text-white font-bold rounded-r-md"
                      : isStart && isEnd
                      ? "bg-purple-600 text-white font-bold rounded-md"
                      : inRange
                      ? "bg-purple-100 text-purple-900 rounded-none"
                      : "text-slate-700 hover:bg-slate-100 rounded-md"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 font-medium px-1 py-0.5 rounded"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleTodayOnly}
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

