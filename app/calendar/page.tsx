"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { QuickAddExpenseModal } from "../../components/modals/QuickAddExpenseModal";
import { api } from "../../lib/api";
import { CalendarMonthResponse, Expense } from "../../types";
import { formatRupees, formatDate, getTodayDateString } from "../../lib/format";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  ReceiptText,
  Clock,
} from "lucide-react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarMonthResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [todayStr, setTodayStr] = useState<string>("");
  const [dayDetails, setDayDetails] = useState<{
    date: string;
    totalExpensePaise: number;
    totalIncomePaise: number;
    transactions: Expense[];
  } | null>(null);

  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const today = getTodayDateString();
    setCurrentDate(now);
    setTodayStr(today);
    setSelectedDate(today);
  }, []);

  const year = currentDate ? currentDate.getFullYear() : 2026;
  const month = currentDate ? currentDate.getMonth() + 1 : 1;

  const fetchCalendarMonth = useCallback(async () => {
    try {
      setLoadingMonth(true);
      const res = await api.calendar.month(year, month);
      if (res.success) {
        setCalendarData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMonth(false);
    }
  }, [year, month]);

  const fetchDayDetails = useCallback(async (dateStr: string) => {
    try {
      setLoadingDay(true);
      const res = await api.calendar.day(dateStr);
      if (res.success) {
        setDayDetails(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDay(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarMonth();
  }, [fetchCalendarMonth]);

  useEffect(() => {
    if (selectedDate) {
      fetchDayDetails(selectedDate);
    }
  }, [selectedDate, fetchDayDetails]);

  const handlePrevMonth = () => {
    setCurrentDate((d) => {
      const base = d || new Date();
      return new Date(base.getFullYear(), base.getMonth() - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((d) => {
      const base = d || new Date();
      return new Date(base.getFullYear(), base.getMonth() + 1, 1);
    });
  };

  const handleTodayMonth = () => {
    setCurrentDate(new Date());
    setSelectedDate(todayStr);
  };

  // Calendar Grid Calculations
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AppLayout
      onRefresh={() => {
        fetchCalendarMonth();
        if (selectedDate) fetchDayDetails(selectedDate);
      }}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Calendar Spending History
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect your daily expense totals and select any day to view details
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsQuickAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add for Selected Date
          </Button>
        </div>

        {/* Layout: Left Calendar Grid, Right Day Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-600" />
                <CardTitle>
                  {monthNames[month - 1]} {year}
                </CardTitle>
                {calendarData && (
                  <Badge variant="primary" className="ml-2 font-bold text-[11px]">
                    Total: {formatRupees(calendarData.monthlyTotalPaise)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={handleTodayMonth}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrevMonth} title="Previous month">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth} title="Next month">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-5">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-400 text-xs mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty padding cells before first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[64px] sm:min-h-[76px] rounded-lg bg-slate-50/50 p-1.5"
                  />
                ))}

                {/* Days of the current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
                    dayNum
                  ).padStart(2, "0")}`;

                  const daySummary = calendarData?.days[dateStr];
                  const spentPaise = daySummary?.totalSpendingPaise || 0;
                  const txCount = daySummary?.transactionCount || 0;

                  const isSelected = selectedDate === dateStr;
                  const isToday = todayStr === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-[64px] sm:min-h-[76px] rounded-xl p-2 text-left flex flex-col justify-between transition-all border ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-600/20"
                          : isToday
                          ? "border-slate-300 bg-slate-50/80 hover:border-purple-300"
                          : "border-slate-200/80 bg-white hover:border-purple-200 hover:bg-purple-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold leading-none ${
                            isSelected
                              ? "text-purple-700"
                              : isToday
                              ? "text-slate-900 bg-purple-100 px-1.5 py-0.5 rounded-md"
                              : "text-slate-700"
                          }`}
                        >
                          {dayNum}
                        </span>

                        {txCount > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                            {txCount} {txCount === 1 ? "txn" : "txns"}
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        {spentPaise > 0 ? (
                          <span className="inline-block text-[11px] font-bold text-slate-900 truncate max-w-full">
                            {formatRupees(spentPaise)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300">
                            ₹0
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details Panel */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div>
                <CardTitle>{formatDate(selectedDate)}</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Day Breakdown</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsQuickAddOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </CardHeader>

            <CardContent className="flex-1 p-5 space-y-4">
              {/* Day Totals Card */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-[11px] font-medium text-purple-700">Expenses</span>
                  <p className="text-sm font-bold text-purple-900 mt-0.5">
                    {formatRupees(dayDetails?.totalExpensePaise || 0)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[11px] font-medium text-emerald-700">Income</span>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">
                    {formatRupees(dayDetails?.totalIncomePaise || 0)}
                  </p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
                  Transactions on this Day
                </h4>

                {loadingDay ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Loading transactions...
                  </p>
                ) : (!dayDetails?.transactions || dayDetails.transactions.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No transactions recorded for this date.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {dayDetails.transactions.map((tx: any) => {
                      const isExpense = tx.type === "expense";
                      const categoryName = tx.categoryId?.name || "General";
                      const categoryColor = tx.categoryId?.color || "#7c3aed";

                      return (
                        <div
                          key={tx._id}
                          className="p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {tx.description || categoryName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {categoryName} • {tx.paymentMethod?.toUpperCase() || "UPI"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-bold ${
                              isExpense ? "text-slate-900" : "text-emerald-600"
                            }`}
                          >
                            {isExpense ? "-" : "+"}
                            {formatRupees(tx.amountPaise)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickAddExpenseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialDate={selectedDate}
        onSuccess={() => {
          fetchCalendarMonth();
          if (selectedDate) fetchDayDetails(selectedDate);
        }}
      />
    </AppLayout>
  );
}
