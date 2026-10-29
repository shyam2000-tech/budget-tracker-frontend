"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { DatePicker } from "../ui/DatePicker";
import { api } from "../../lib/api";
import { Category } from "../../types";
import { rupeesToPaise, getTodayDateString } from "../../lib/format";

interface QuickAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string;
}

export const QuickAddExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}: QuickAddExpenseModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [amountRupees, setAmountRupees] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(initialDate || "");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    } else {
      setDate(getTodayDateString());
    }
  }, [initialDate, isOpen]);

  useEffect(() => {
    if (isOpen) {
      api.categories
        .list()
        .then((res) => {
          if (res.success && res.data) {
            setCategories(res.data);
            if (res.data.length > 0 && !categoryId) {
              setCategoryId(res.data[0]._id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPaise = rupeesToPaise(amountRupees);
    if (!parsedPaise || parsedPaise <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    setLoading(true);

    try {
      await api.expenses.create({
        amountPaise: parsedPaise,
        categoryId,
        description: description.trim(),
        type,
        date: date || getTodayDateString(),
        paymentMethod,
      });

      // Reset form
      setAmountRupees("");
      setDescription("");
      setError(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Transaction"
      description="Record a daily expense or income quickly"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              type === "expense"
                ? "bg-white text-purple-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              type === "income"
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
          placeholder="0.00"
          value={amountRupees}
          onChange={(e) => setAmountRupees(e.target.value)}
          required
          autoFocus
        />

        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
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
          value={date}
          onChange={(d) => setDate(d)}
        />

        <Input
          label="Description (Optional)"
          type="text"
          placeholder="e.g. Lunch at cafeteria, Groceries"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={100}
        />

        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="upi">UPI / GPay / PhonePe</option>
          <option value="cash">Cash</option>
          <option value="card">Debit / Credit Card</option>
          <option value="netbanking">Net Banking</option>
        </Select>

        <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            className="text-xs"
          >
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
