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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-6 sm:gap-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-bold text-slate-900 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-2xs group-hover:bg-purple-700 transition-colors">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 leading-tight">
                    DailyBudget
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-purple-600 font-semibold uppercase tracking-wider">
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
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-purple-50 text-purple-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsQuickAddOpen(true)}
                className="shadow-2xs text-xs px-2 sm:px-3 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quick Add</span>
              </Button>

              <div className="flex items-center gap-1.5 pl-1.5 sm:pl-3 sm:border-l border-slate-200 text-xs text-slate-700">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] sm:text-xs">
                  {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-3 h-3" />}
                </div>
                <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                  {user?.name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Log out"
                className="text-slate-400 hover:text-rose-600 p-1.5"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden border-t border-slate-100 px-1 py-1 flex items-center justify-around bg-slate-50/70">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md text-[9px] font-medium transition-colors ${
                  isActive
                    ? "text-purple-700 font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
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
