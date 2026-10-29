"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { DatePicker } from "../../components/ui/DatePicker";
import { DateRangePicker } from "../../components/ui/DateRangePicker";
import { QuickAddExpenseModal } from "../../components/modals/QuickAddExpenseModal";
import { api } from "../../lib/api";
import { Expense, Category } from "../../types";
import { formatRupees, formatDate, rupeesToPaise } from "../../lib/format";
import {
  Search,
  Trash2,
  Edit2,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmountRupees, setEditAmountRupees] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<"expense" | "income">("expense");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.categories.list();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams: Record<string, string> = {
        page: String(page),
        limit: "15",
      };
      if (search.trim()) queryParams.search = search.trim();
      if (categoryId) queryParams.categoryId = categoryId;
      if (type) queryParams.type = type;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      const res = await api.expenses.list(queryParams);
      if (res.success) {
        setExpenses(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, type, startDate, endDate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Open Edit Modal
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmountRupees(String(expense.amountPaise / 100));
    setEditCategoryId(
      typeof expense.categoryId === "object"
        ? expense.categoryId._id
        : expense.categoryId
    );
    setEditDescription(expense.description || "");
    setEditDate(expense.date ? expense.date.slice(0, 10) : "");
    setEditType(expense.type);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const paise = rupeesToPaise(editAmountRupees);
    if (!paise || paise <= 0) {
      setEditError("Amount must be greater than 0");
      return;
    }

    setEditLoading(true);
    try {
      await api.expenses.update(editingExpense._id, {
        amountPaise: paise,
        categoryId: editCategoryId,
        description: editDescription.trim(),
        date: editDate,
        type: editType,
      });

      setEditingExpense(null);
      fetchExpenses();
    } catch (err: any) {
      setEditError(err.message || "Failed to update expense");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    setDeletingId(id);
    try {
      await api.expenses.delete(id);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout onRefresh={fetchExpenses}>
      <div className="space-y-4 sm:space-y-5">
        {/* Filter Toolbar */}
        <Card className="p-2.5 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative col-span-2 sm:col-span-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white text-slate-700"
            >
              <option value="">All Types</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Single Combined Date Range Picker (From -> To) */}
            <div className="col-span-2 sm:col-span-1">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={({ startDate: s, endDate: e }) => {
                  setStartDate(s);
                  setEndDate(e);
                  setPage(1);
                }}
                placeholder="Filter by date range"
              />
            </div>
          </div>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <ReceiptText className="w-3.5 h-3.5 text-purple-600" />
              <CardTitle>Transactions List ({totalCount})</CardTitle>
            </div>
            {loading && (
              <span className="text-[10px] text-slate-400">Updating...</span>
            )}
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {expenses.length === 0 && !loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No transactions found matching your filters.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[9px] sm:text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-3.5 py-2.5 sm:px-5 sm:py-3 font-semibold">Date</th>
                    <th className="px-3.5 py-2.5 sm:px-5 sm:py-3 font-semibold">Category</th>
                    <th className="px-3.5 py-2.5 sm:px-5 sm:py-3 font-semibold">Description</th>
                    <th className="px-3.5 py-2.5 sm:px-5 sm:py-3 font-semibold">Method</th>
                    <th className="px-3.5 py-2.5 sm:px-5 sm:py-3 font-semibold text-right">Amount</th>
                    <th className="px-3.5 py-2.5 sm:px-5 sm:py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.map((expense) => {
                    const isExpense = expense.type === "expense";
                    const category =
                      typeof expense.categoryId === "object"
                        ? (expense.categoryId as Category)
                        : null;
                    const catName = category?.name || "General";
                    const catColor = category?.color || "#7c3aed";

                    return (
                      <tr
                        key={expense._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-3.5 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap text-slate-600 font-medium text-[11px] sm:text-xs">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-3.5 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-900 text-[11px] sm:text-xs">
                            <span
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                              style={{ backgroundColor: catColor }}
                            />
                            {catName}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 sm:px-5 sm:py-2.5 max-w-xs truncate text-slate-800 text-[11px] sm:text-xs">
                          {expense.description || "—"}
                        </td>
                        <td className="px-3.5 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap uppercase text-[9px] font-semibold text-slate-400">
                          {expense.paymentMethod || "UPI"}
                        </td>
                        <td className="px-3.5 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap text-right font-bold text-[11px] sm:text-xs">
                          <span
                            className={
                              isExpense ? "text-slate-900" : "text-emerald-600"
                            }
                          >
                            {isExpense ? "-" : "+"}
                            {formatRupees(expense.amountPaise)}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditClick(expense)}
                              className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                              title="Edit expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              disabled={deletingId === expense._id}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="px-3.5 py-2 sm:px-5 sm:py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2 py-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Add Modal */}
      <QuickAddExpenseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={fetchExpenses}
      />

      {/* Edit Expense Modal */}
      {editingExpense && (
        <Modal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          title="Edit Transaction"
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5">
            {editError && (
              <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {editError}
              </div>
            )}

            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setEditType("expense")}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                  editType === "expense"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setEditType("income")}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                  editType === "income"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Income
              </button>
            </div>

            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={editAmountRupees}
              onChange={(e) => setEditAmountRupees(e.target.value)}
              required
            />

            <Select
              label="Category"
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <DatePicker
              label="Date"
              value={editDate}
              onChange={(d) => setEditDate(d)}
            />

            <Input
              label="Description"
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingExpense(null)}
                disabled={editLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={editLoading}
                className="text-xs"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
