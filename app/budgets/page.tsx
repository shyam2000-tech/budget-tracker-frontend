"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { DatePicker } from "../../components/ui/DatePicker";
import { MonthPicker } from "../../components/ui/MonthPicker";
import { api } from "../../lib/api";
import { Budget, Category } from "../../types";
import {
  formatRupees,
  rupeesToPaise,
  getCurrentMonthString,
  getTodayDateString,
} from "../../lib/format";
import {
  Plus,
  PiggyBank,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [periodFilter, setPeriodFilter] = useState<"monthly" | "daily">("monthly");
  const [applicablePeriod, setApplicablePeriod] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPeriod, setFormPeriod] = useState<"daily" | "monthly">("monthly");
  const [formApplicablePeriod, setFormApplicablePeriod] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formLimitRupees, setFormLimitRupees] = useState("");
  const [formThreshold, setFormThreshold] = useState("80");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const currentMonth = getCurrentMonthString();
    setApplicablePeriod(currentMonth);
    setFormApplicablePeriod(currentMonth);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.categories.list();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    if (!applicablePeriod) return;
    try {
      setLoading(true);
      const res = await api.budgets.list({
        period: periodFilter,
        applicablePeriod,
      });
      if (res.success) {
        setBudgets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [periodFilter, applicablePeriod]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handlePeriodFilterChange = (newPeriod: "monthly" | "daily") => {
    setPeriodFilter(newPeriod);
    if (newPeriod === "monthly") {
      setApplicablePeriod(getCurrentMonthString());
    } else {
      setApplicablePeriod(getTodayDateString());
    }
  };

  const handleOpenCreateModal = () => {
    setFormPeriod(periodFilter);
    setFormApplicablePeriod(applicablePeriod);
    setFormCategoryId("");
    setFormLimitRupees("");
    setFormThreshold("80");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const limitPaise = rupeesToPaise(formLimitRupees);
    if (!limitPaise || limitPaise <= 0) {
      setFormError("Budget limit must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      await api.budgets.create({
        categoryId: formCategoryId || null,
        period: formPeriod,
        applicablePeriod: formApplicablePeriod,
        limitPaise,
        alertThreshold: parseInt(formThreshold, 10) || 80,
      });

      setIsModalOpen(false);
      fetchBudgets();
    } catch (err: any) {
      setFormError(err.message || "Failed to create budget");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Are you sure you want to remove this budget?")) return;
    try {
      await api.budgets.delete(id);
      fetchBudgets();
    } catch (err: any) {
      alert(err.message || "Failed to delete budget");
    }
  };

  return (
    <AppLayout onRefresh={fetchBudgets}>
      <div className="space-y-4 sm:space-y-5">
        {/* Period Selector Tabs */}
        <Card className="p-2.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex rounded-lg bg-slate-100 p-0.5 sm:p-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handlePeriodFilterChange("monthly")}
                className={`flex-1 sm:flex-initial px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  periodFilter === "monthly"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Budgets
              </button>
              <button
                type="button"
                onClick={() => handlePeriodFilterChange("daily")}
                className={`flex-1 sm:flex-initial px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  periodFilter === "daily"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daily Budgets
              </button>
            </div>

            {/* Applicable Period input */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[11px] font-medium text-slate-500">Period:</span>
              {periodFilter === "monthly" ? (
                <div className="w-28 sm:w-32">
                  <MonthPicker
                    value={applicablePeriod}
                    onChange={(m) => setApplicablePeriod(m)}
                    placeholder="Pick month"
                    align="right"
                    size="sm"
                  />
                </div>
              ) : (
                <div className="w-28 sm:w-32">
                  <DatePicker
                    value={applicablePeriod}
                    onChange={(d) => setApplicablePeriod(d)}
                    placeholder="Pick date"
                    align="right"
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Budgets Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-purple-600" />
              <CardTitle>
                Active Limits ({budgets.length})
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {loading && <span className="text-[10px] text-slate-400">Loading...</span>}
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                className="text-xs px-2.5 py-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Set Limit</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 && !loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No budgets configured for {applicablePeriod}. Click &quot;Set Limit&quot; to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                {budgets.map((b) => {
                  const categoryName = b.category ? b.category.name : "Overall Spending Limit";
                  const categoryColor = b.category ? b.category.color : "#7c3aed";

                  return (
                    <div
                      key={b.id}
                      className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white text-[11px] sm:text-xs font-bold shrink-0"
                            style={{ backgroundColor: categoryColor || "#7c3aed" }}
                          >
                            {categoryName[0]}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {categoryName}
                            </h4>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase">
                              {b.period} • {b.applicablePeriod}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBudget(b.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Numbers */}
                      <div className="flex items-baseline justify-between text-xs pt-0.5">
                        <div>
                          <span className="text-slate-400 text-[11px]">Spent: </span>
                          <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                            {formatRupees(b.spentPaise)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Limit: </span>
                          <span className="font-bold text-slate-700 text-[11px] sm:text-xs">
                            {formatRupees(b.limitPaise)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, b.percentageConsumed)}%` }}
                          className={`h-full transition-all duration-300 ${
                            b.isExceeded
                              ? "bg-rose-500"
                              : b.isWarning
                              ? "bg-amber-500"
                              : "bg-purple-600"
                          }`}
                        />
                      </div>

                      {/* Bottom status badge */}
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-0.5">
                        <span className="text-slate-500 font-medium">
                          {b.percentageConsumed}% used
                        </span>

                        {b.isExceeded ? (
                          <Badge variant="danger" className="text-[9px] py-0 px-1">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            Over {formatRupees(b.spentPaise - b.limitPaise)}
                          </Badge>
                        ) : b.isWarning ? (
                          <Badge variant="warning" className="text-[9px] py-0 px-1">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            Near Limit
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[9px] py-0 px-1">
                            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                            {formatRupees(b.remainingPaise)} left
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Budget Limit"
        description="Define a spending limit for a category or total monthly spend"
        maxWidth="md"
      >
        <form onSubmit={handleSaveBudget} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setFormPeriod("monthly");
                setFormApplicablePeriod(getCurrentMonthString());
              }}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                formPeriod === "monthly"
                  ? "bg-white text-purple-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setFormPeriod("daily");
                setFormApplicablePeriod(getTodayDateString());
              }}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                formPeriod === "daily"
                  ? "bg-white text-purple-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily Budget
            </button>
          </div>

          <Select
            label="Category"
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
          >
            <option value="">Overall Total Spending (All Categories)</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>

          {formPeriod === "monthly" ? (
            <MonthPicker
              label="Applicable Month"
              value={formApplicablePeriod}
              onChange={(m) => setFormApplicablePeriod(m)}
              align="left"
            />
          ) : (
            <DatePicker
              label="Applicable Date"
              value={formApplicablePeriod}
              onChange={(d) => setFormApplicablePeriod(d)}
            />
          )}

          <Input
            label="Spending Limit (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 5000"
            value={formLimitRupees}
            onChange={(e) => setFormLimitRupees(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Warning Alert Threshold (%)"
            type="number"
            min="1"
            max="100"
            value={formThreshold}
            onChange={(e) => setFormThreshold(e.target.value)}
            helperText="Highlight warning when spending reaches this percentage"
          />

          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
              className="text-xs"
            >
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
