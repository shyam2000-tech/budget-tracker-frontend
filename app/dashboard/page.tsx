"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "../../components/layout/AppLayout";
import { SpendingTrendChart } from "../../components/dashboard/SpendingTrendChart";
import { WalletIllustration } from "../../components/dashboard/WalletIllustration";
import { MonthPicker } from "../../components/ui/MonthPicker";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  DashboardOverview,
  MonthSpendingSummary,
  DaySpendingSummary,
  Category,
} from "../../types";
import { formatRupees, formatDate, getCurrentMonthString } from "../../lib/format";
import {
  Wallet,
  TrendingUp,
  Layers,
  BarChart3,
  Clock,
  ArrowRight,
  Utensils,
  ShoppingCart,
  Car,
  ReceiptText,
  Tv,
  HeartPulse,
  BookOpen,
  Tag,
  ChevronDown,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [monthSummary, setMonthSummary] = useState<MonthSpendingSummary | null>(null);
  const [todaySummary, setTodaySummary] = useState<DaySpendingSummary | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [greeting, setGreeting] = useState("Good Afternoon,");

  useEffect(() => {
    setSelectedMonth(getCurrentMonthString());
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning,");
    else if (hour < 17) setGreeting("Good Afternoon,");
    else setGreeting("Good Evening,");
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, monthRes, todayRes, categoriesRes] = await Promise.all([
        api.dashboard.overview(),
        api.dashboard.monthly(),
        api.dashboard.daily(),
        api.categories.list(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (monthRes.success) setMonthSummary(monthRes.data);
      if (todayRes.success) setTodaySummary(todayRes.data);
      if (categoriesRes.success) setAllCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format month name for display in hero pill e.g. "Nov 2026"
  const formatMonthPill = (monthStr: string) => {
    if (!monthStr || !monthStr.includes("-")) return "Nov 2026";
    const [y, m] = monthStr.split("-");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthIdx = parseInt(m, 10) - 1;
    return `${monthNames[monthIdx] || ""} ${y}`;
  };

  // Helper icon selection for categories
  const getCategoryIcon = (name: string, color?: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("food") || lower.includes("dine") || lower.includes("lunch") || lower.includes("restaurant") || lower.includes("cafe")) {
      return <Utensils className="w-5 h-5 text-purple-600" />;
    }
    if (lower.includes("shop") || lower.includes("grocer") || lower.includes("store") || lower.includes("market")) {
      return <ShoppingCart className="w-5 h-5 text-indigo-600" />;
    }
    if (lower.includes("trans") || lower.includes("fuel") || lower.includes("travel") || lower.includes("car")) {
      return <Car className="w-5 h-5 text-cyan-600" />;
    }
    if (lower.includes("bill") || lower.includes("util") || lower.includes("rent") || lower.includes("recharge")) {
      return <ReceiptText className="w-5 h-5 text-amber-600" />;
    }
    if (lower.includes("ent") || lower.includes("movie") || lower.includes("show") || lower.includes("netflix")) {
      return <Tv className="w-5 h-5 text-rose-600" />;
    }
    if (lower.includes("health") || lower.includes("medic") || lower.includes("doctor")) {
      return <HeartPulse className="w-5 h-5 text-emerald-600" />;
    }
    if (lower.includes("book") || lower.includes("course") || lower.includes("study") || lower.includes("edu")) {
      return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
    return <Tag className="w-5 h-5 text-purple-600" />;
  };

  // Sorted Categories: High to Low (most expensed category first, then lower ones)
  const sortedCategories = useMemo(() => {
    const spendingMap = new Map<string, number>();
    if (overview?.topCategories) {
      for (const item of overview.topCategories) {
        spendingMap.set(item.categoryId, item.totalPaise);
      }
    }

    if (allCategories.length > 0) {
      const list = allCategories.map((c) => ({
        categoryId: c._id,
        name: c.name,
        color: c.color || "#7c3aed",
        totalPaise: spendingMap.get(c._id) || 0,
      }));

      // High to low sorting: most spent first
      list.sort((a, b) => {
        if (b.totalPaise !== a.totalPaise) {
          return b.totalPaise - a.totalPaise;
        }
        return a.name.localeCompare(b.name);
      });

      return list;
    }

    if (overview?.topCategories && overview.topCategories.length > 0) {
      const list = [...overview.topCategories];
      list.sort((a, b) => b.totalPaise - a.totalPaise);
      return list;
    }

    return [];
  }, [allCategories, overview?.topCategories]);

  const firstName = user?.name ? user.name.split(" ")[0] : "Shyam";

  return (
    <AppLayout onRefresh={fetchDashboardData}>
      <div className="space-y-4 sm:space-y-5">
        {/* Hero Greeting Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#291b49] via-[#372462] to-[#1c1236] p-5 sm:p-6 text-white shadow-lg border border-purple-900/30">
          {/* Subtle curved background wave */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-purple-600/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Left Content */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-purple-200/90">
                {greeting}
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>{firstName}</span>
                <span className="inline-block animate-wave text-xl sm:text-2xl">👋</span>
              </h2>
              <p className="text-xs text-purple-200/80 pt-0.5">
                Keep your spending in control.
              </p>

              {/* Month Selector Pill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs backdrop-blur-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-300" />
                  <span>{formatMonthPill(selectedMonth)}</span>
                  <ChevronDown className="w-3 h-3 text-purple-300" />
                </button>

                {isMonthPickerOpen && (
                  <div className="absolute left-5 mt-2 z-50">
                    <MonthPicker
                      value={selectedMonth}
                      onChange={(m) => {
                        setSelectedMonth(m);
                        setIsMonthPickerOpen(false);
                      }}
                      align="left"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right 3D Wallet Illustration */}
            <WalletIllustration className="w-28 h-24 sm:w-36 sm:h-28" />
          </div>
        </div>

        {/* 4 Metric KPI Cards - 2x2 Pastel Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {/* Month Income */}
          <div className="bg-[#eefcf2] border border-[#d1fae5] rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-emerald-600 mb-2">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-700">
              Month Income
            </p>
            <p className="text-sm sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatRupees(overview?.monthIncomePaise || 0)}
            </p>
          </div>

          {/* Month Spend */}
          <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-rose-500 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-700">
              Month Spend
            </p>
            <p className="text-sm sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatRupees(overview?.monthExpensePaise || 0)}
            </p>
          </div>

          {/* Net Savings */}
          <div className="bg-[#f5f3ff] border border-[#ede9fe] rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-purple-600 mb-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-700">
              Net Savings
            </p>
            <p
              className={`text-sm sm:text-lg font-bold mt-0.5 truncate ${
                (overview?.netSavingsPaise || 0) >= 0
                  ? "text-slate-900"
                  : "text-rose-600"
              }`}
            >
              {formatRupees(overview?.netSavingsPaise || 0)}
            </p>
          </div>

          {/* Today's Spend */}
          <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center text-amber-500 mb-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-700">
              Today&apos;s Spend
            </p>
            <p className="text-sm sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatRupees(overview?.todayExpensePaise || 0)}
            </p>
          </div>
        </div>

        {/* Spending Trajectory Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Spending Trajectory
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Your daily spending this month
                </p>
              </div>
            </div>

            {/* Daily Dropdown Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700">
              <span>Daily</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Bar Chart */}
          <SpendingTrendChart data={monthSummary?.dailyTrend || []} />
        </div>

        {/* Top Categories Section - Horizontally Scrollable (High to Low Filter) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Top Categories
            </h3>
            <Link
              href="/categories"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Horizontally Scrollable Categories (Side Scroll, High to Low) */}
          {sortedCategories.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center text-xs text-slate-400">
              No categories available yet. Click &quot;View all&quot; to manage categories.
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 -mx-1 px-1 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {sortedCategories.map((cat, idx) => {
                const isTopExpense = idx === 0 && cat.totalPaise > 0;
                return (
                  <div
                    key={cat.categoryId}
                    className={`shrink-0 w-24 sm:w-28 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all ${
                      isTopExpense
                        ? "bg-[#f5f0ff] border border-purple-200 shadow-2xs"
                        : "bg-white border border-slate-100 shadow-2xs hover:border-slate-200"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-center">
                      {getCategoryIcon(cat.name, cat.color)}
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-800 truncate w-full">
                      {cat.name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-900 mt-0.5 truncate w-full">
                      {formatRupees(cat.totalPaise)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Recent Transactions
              </h3>
            </div>
            <Link
              href="/expenses"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Transactions List */}
          {(!overview?.recentTransactions || overview.recentTransactions.length === 0) ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center text-xs text-slate-400">
              No recent transactions recorded yet. Tap the <strong>+</strong> button below to record your first transaction!
            </div>
          ) : (
            <div className="space-y-2">
              {overview.recentTransactions.slice(0, 5).map((tx: any) => {
                const isIncome = tx.type === "income";
                const categoryName = tx.categoryId?.name || "General";
                const paymentMethod = tx.paymentMethod ? tx.paymentMethod.toUpperCase() : "UPI";

                return (
                  <div
                    key={tx._id}
                    className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-2xs flex items-center justify-between hover:border-purple-200 transition-colors"
                  >
                    {/* Left Icon & Details */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {isIncome ? (
                          <Wallet className="w-4 h-4" />
                        ) : (
                          getCategoryIcon(categoryName)
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {tx.description || categoryName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                          {formatDate(tx.date)} • {paymentMethod}
                        </p>
                      </div>
                    </div>

                    {/* Right Amount & Badge */}
                    <div className="text-right shrink-0 pl-2">
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          isIncome ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatRupees(tx.amountPaise)}
                      </p>
                      <div className="mt-0.5">
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
