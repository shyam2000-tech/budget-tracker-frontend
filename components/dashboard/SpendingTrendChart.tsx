"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  if (!data || data.length === 0) {
    return (
      <div className="h-36 sm:h-48 flex items-center justify-center text-xs text-slate-400">
        No spending recorded this month yet.
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((d) => ({
    date: d.date.slice(8), // show just day "01", "02", etc.
    fullDate: d.date,
    amount: d.totalPaise / 100,
    amountPaise: d.totalPaise,
  }));

  return (
    <div className="w-full h-36 sm:h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white rounded-lg px-3 py-1.5 shadow-lg text-xs">
                    <p className="text-slate-400 text-[10px]">{item.fullDate}</p>
                    <p className="font-semibold text-purple-200">
                      {formatRupees(item.amountPaise)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#7c3aed"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#purpleGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
