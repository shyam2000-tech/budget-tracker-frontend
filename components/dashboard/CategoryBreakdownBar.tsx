"use client";

import React from "react";
import { CategorySpending } from "../../types";
import { formatRupees } from "../../lib/format";

interface CategoryBreakdownBarProps {
  categories: CategorySpending[];
}

export const CategoryBreakdownBar = ({ categories }: CategoryBreakdownBarProps) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No category spending recorded.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual Multi-Segment Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
        {categories.map((cat) => (
          <div
            key={cat.categoryId}
            style={{
              width: `${cat.percentage}%`,
              backgroundColor: cat.color || "#7c3aed",
            }}
            title={`${cat.name}: ${cat.percentage}%`}
            className="h-full transition-all duration-300"
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-2.5">
        {categories.slice(0, 5).map((cat) => (
          <div
            key={cat.categoryId}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color || "#7c3aed" }}
              />
              <span className="font-medium text-slate-700">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{cat.percentage}%</span>
              <span className="font-semibold text-slate-900">
                {formatRupees(cat.totalPaise)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

