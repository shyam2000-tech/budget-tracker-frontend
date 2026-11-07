"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatRupees } from "../../lib/format";

interface SpendingTrendChartProps {
  data: { date: string; totalPaise: number }[];
}

export const SpendingTrendChart = ({ data }: SpendingTrendChartProps) => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // If no data, render empty state with subtle placeholder bars
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-400">
        <p className="font-medium text-slate-500">No daily spending recorded this month yet.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Your daily spending trajectory will appear here.</p>
      </div>
    );
  }

  // Format data for bar chart
  const chartData = data.map((d) => {
    const parts = d.date.split("-");
    const day = parts[2] ? parseInt(parts[2], 10) : 1;
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
    const label = `${day} ${monthNames[month] || ""}`;

    return {
      day,
      dateLabel: label,
      fullDate: d.date,
      amount: d.totalPaise / 100,
      amountPaise: d.totalPaise,
    };
  });

  // Helper for formatting Y-axis numbers like 2K, 4K, 6K
  const formatYAxis = (val: number) => {
    if (val >= 1000) {
      const k = val / 1000;
      return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
    }
    return `${val}`;
  };

  return (
    <div className="w-full h-44 sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 6, left: -20, bottom: 0 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="purpleBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="dateLabel"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#64748b" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc", opacity: 0.6 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-[#140e26] text-white rounded-xl px-3 py-1.5 shadow-xl text-xs border border-purple-900/40">
                    <p className="text-purple-300 text-[10px] font-medium">{item.fullDate}</p>
                    <p className="font-bold text-white text-sm">
                      {formatRupees(item.amountPaise)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="amount"
            fill="url(#purpleBarGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
