"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { QuickAddExpenseModal } from "../modals/QuickAddExpenseModal";
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Tags,
  PiggyBank,
  CalendarDays,
  Plus,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export const Navbar = ({ onExpenseAdded }: { onExpenseAdded?: () => void }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Expenses", href: "/expenses", icon: ReceiptText },
    { label: "Categories", href: "/categories", icon: Tags },
    { label: "Budgets", href: "/budgets", icon: PiggyBank },
    { label: "Calendar", href: "/calendar", icon: CalendarDays },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 font-bold text-slate-900 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:bg-purple-700 transition-colors">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                    DailyBudget
                  </span>
                  <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">
                    Tracker
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-purple-50 text-purple-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsQuickAddOpen(true)}
                className="shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Add</span>
              </Button>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-700">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="font-medium max-w-[120px] truncate">
                  {user?.name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Log out"
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden border-t border-slate-100 px-2 py-1.5 flex items-center justify-around bg-slate-50/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-purple-700 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      <QuickAddExpenseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          if (onExpenseAdded) onExpenseAdded();
        }}
      />
    </>
  );
};

