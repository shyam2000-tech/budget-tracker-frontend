"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { SpendingTrendChart } from "../../components/dashboard/SpendingTrendChart";
import { CategoryBreakdownBar } from "../../components/dashboard/CategoryBreakdownBar";
import { QuickAddExpenseModal } from "../../components/modals/QuickAddExpenseModal";
import { api } from "../../lib/api";
import {
  DashboardOverview,
  MonthSpendingSummary,
  DaySpendingSummary,
} from "../../types";
import { formatRupees, formatDate } from "../../lib/format";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Plus,
  AlertTriangle,
  CheckCircle,
  ReceiptText,
} from "lucide-react";

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [monthSummary, setMonthSummary] = useState<MonthSpendingSummary | null>(null);
  const [todaySummary, setTodaySummary] = useState<DaySpendingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, monthRes, todayRes] = await Promise.all([
        api.dashboard.overview(),
        api.dashboard.monthly(),
        api.dashboard.daily(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (monthRes.success) setMonthSummary(monthRes.data);
      if (todayRes.success) setTodaySummary(todayRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AppLayout onRefresh={fetchDashboardData}>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Financial Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Summary of your daily and monthly spending activity
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsQuickAddOpen(true)}
            className="shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Quick Add Expense
          </Button>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today Spending */}
          <Card className="p-4 bg-white border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Today&apos;s Spending
              </span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900">
                {formatRupees(overview?.todayExpensePaise || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {todaySummary?.transactionCount || 0} transaction(s) today
              </p>
            </div>
          </Card>

          {/* Monthly Spending */}
          <Card className="p-4 bg-white border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Monthly Spending
              </span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900">
                {formatRupees(overview?.monthExpensePaise || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Avg. {formatRupees(monthSummary?.dailyAveragePaise || 0)} / day
              </p>
            </div>
          </Card>

          {/* Monthly Income */}
          <Card className="p-4 bg-white border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Monthly Income
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900">
                {formatRupees(overview?.monthIncomePaise || 0)}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                Recorded income this month
              </p>
            </div>
          </Card>

          {/* Net Savings */}
          <Card className="p-4 bg-white border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Net Savings
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div
                className={`text-xl font-bold ${
                  (overview?.netSavingsPaise || 0) >= 0
                    ? "text-slate-900"
                    : "text-rose-600"
                }`}
              >
                {formatRupees(overview?.netSavingsPaise || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {(overview?.netSavingsPaise || 0) >= 0 ? "Surplus" : "Deficit"}
              </p>
            </div>
          </Card>
        </div>

        {/* Budget Status Banner if budget exists */}
        {overview?.budgetSummary && (
          <Card className="p-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/50 border border-purple-200/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {overview.budgetSummary.percentageConsumed > 100 ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : overview.budgetSummary.percentageConsumed >= 80 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-purple-600 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Monthly Spending Limit Progress
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    You have spent{" "}
                    <span className="font-semibold text-slate-900">
                      {formatRupees(overview.budgetSummary.totalSpentPaise)}
                    </span>{" "}
                    of your{" "}
                    <span className="font-semibold text-slate-900">
                      {formatRupees(overview.budgetSummary.totalBudgetPaise)}
                    </span>{" "}
                    limit ({overview.budgetSummary.percentageConsumed}%)
                  </p>
                </div>
              </div>
              <Link href="/budgets">
                <Button variant="outline" size="sm" className="bg-white">
                  Manage Budgets
                </Button>
              </Link>
            </div>
            {/* Progress bar */}
            <div className="mt-3 w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, overview.budgetSummary.percentageConsumed)}%`,
                }}
                className={`h-full transition-all duration-300 ${
                  overview.budgetSummary.percentageConsumed > 100
                    ? "bg-rose-500"
                    : overview.budgetSummary.percentageConsumed >= 80
                    ? "bg-amber-500"
                    : "bg-purple-600"
                }`}
              />
            </div>
          </Card>
        )}

        {/* Charts & Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Trend Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending Trajectory (Current Month)</CardTitle>
              <span className="text-xs text-slate-400">Daily totals in ₹</span>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                  Loading trend data...
                </div>
              ) : (
                <SpendingTrendChart data={monthSummary?.dailyTrend || []} />
              )}
            </CardContent>
          </Card>

          {/* Category-Wise Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Top Categories this Month</CardTitle>
              <Link
                href="/categories"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading category data...
                </div>
              ) : (
                <CategoryBreakdownBar
                  categories={overview?.topCategories || []}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-purple-600" />
              <CardTitle>Recent Transactions</CardTitle>
            </div>
            <Link
              href="/expenses"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              See all expenses &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {(!overview?.recentTransactions || overview.recentTransactions.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No transactions recorded yet. Click &quot;Quick Add Expense&quot; above to add your first expense!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overview.recentTransactions.map((tx: any) => {
                  const isExpense = tx.type === "expense";
                  const categoryName = tx.categoryId?.name || "General";
                  const categoryColor = tx.categoryId?.color || "#7c3aed";

                  return (
                    <div
                      key={tx._id}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: categoryColor }}
                        >
                          {categoryName[0]}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {tx.description || categoryName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{categoryName}</span>
                            <span>•</span>
                            <span>{formatDate(tx.date)}</span>
                            <span>•</span>
                            <span className="uppercase text-[10px] bg-slate-100 px-1 rounded text-slate-500">
                              {tx.paymentMethod || "UPI"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            isExpense ? "text-slate-900" : "text-emerald-600"
                          }`}
                        >
                          {isExpense ? "-" : "+"}
                          {formatRupees(tx.amountPaise)}
                        </span>
                        <div>
                          <Badge
                            variant={isExpense ? "neutral" : "success"}
                            className="text-[10px] py-0 px-1.5 mt-0.5"
                          >
                            {tx.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QuickAddExpenseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </AppLayout>
  );
}

