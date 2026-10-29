"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { api } from "../../lib/api";
import { Category } from "../../types";
import { Plus, Tags, Trash2, Edit2, AlertCircle } from "lucide-react";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#7c3aed", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#eab308", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#64748b", // Slate
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#7c3aed");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Safe Deletion Reassignment Modal State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState("");
  const [deletionWarning, setDeletionWarning] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.categories.list();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setColor("#7c3aed");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color || "#7c3aed");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Category name is required");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingCategory) {
        await api.categories.update(editingCategory._id, {
          name: name.trim(),
          color,
        });
      } else {
        await api.categories.create({
          name: name.trim(),
          color,
        });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttempt = async (category: Category) => {
    setDeletingCategory(category);
    setDeletionWarning(null);

    // Pick first available other category as default reassign target
    const fallback = categories.find((c) => c._id !== category._id);
    if (fallback) setReassignTargetId(fallback._id);

    try {
      // Try direct deletion
      await api.categories.delete(category._id);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      // If error mentions linked expenses, open safe reassignment dialog
      setDeletionWarning(err.message || "Cannot delete category directly");
    }
  };

  const handleConfirmReassignDelete = async () => {
    if (!deletingCategory || !reassignTargetId) return;

    setDeleteLoading(true);
    try {
      await api.categories.delete(deletingCategory._id, reassignTargetId);
      setDeletingCategory(null);
      setDeletionWarning(null);
      fetchCategories();
    } catch (err: any) {
      setDeletionWarning(err.message || "Failed to reassign and delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout onRefresh={fetchCategories}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Custom Categories
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize your expenses with custom labels and colors
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        </div>

        {/* Categories Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tags className="w-4 h-4 text-purple-600" />
              <CardTitle>Your Categories ({categories.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No categories found. Click &quot;New Category&quot; to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between bg-white shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: cat.color || "#7c3aed" }}
                      >
                        {cat.name[0]}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {cat.name}
                        </p>
                        {cat.isDefault && (
                          <Badge variant="neutral" className="text-[9px] py-0 px-1 mt-0.5">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAttempt(cat)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create New Category"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {formError}
            </div>
          )}

          <Input
            label="Category Name"
            type="text"
            placeholder="e.g. Subscriptions, Books"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-purple-600 scale-110"
                      : "hover:scale-105"
                  }`}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Safe Reassignment Deletion Modal */}
      {deletionWarning && deletingCategory && (
        <Modal
          isOpen={true}
          onClose={() => {
            setDeletingCategory(null);
            setDeletionWarning(null);
          }}
          title="Safe Category Deletion"
          description="This category has existing expenses or budgets linked to it."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deletionWarning}</span>
            </div>

            <Select
              label="Reassign linked expenses to:"
              value={reassignTargetId}
              onChange={(e) => setReassignTargetId(e.target.value)}
            >
              {categories
                .filter((c) => c._id !== deletingCategory._id)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </Select>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeletingCategory(null);
                  setDeletionWarning(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReassignDelete}
                isLoading={deleteLoading}
              >
                Reassign & Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

