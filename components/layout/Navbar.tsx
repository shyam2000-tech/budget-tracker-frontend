"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { QuickAddExpenseModal } from "../modals/QuickAddExpenseModal";
import {
  Wallet,
  Home,
  ReceiptText,
  Tags,
  Layers,
  CalendarDays,
  Plus,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export const Navbar = ({ onExpenseAdded }: { onExpenseAdded?: () => void }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Left 2 items
  const leftNavItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard" || pathname === "/",
    },
    {
      label: "Expenses",
      href: "/expenses",
      icon: ReceiptText,
      isActive: pathname.startsWith("/expenses"),
    },
  ];

  // Right 2 items
  const rightNavItems = [
    {
      label: "Budgets",
      href: "/budgets",
      icon: Layers,
      isActive: pathname.startsWith("/budgets"),
    },
    {
      label: "Category",
      href: "/categories",
      icon: Tags,
      isActive: pathname.startsWith("/categories"),
    },
  ];

  const isCalendarActive = pathname.startsWith("/calendar");

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#fbfbfe]/90 backdrop-blur-md">
        <div className="max-w-md sm:max-w-2xl md:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & App Title */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <Wallet className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
              KashKutie
            </h1>
          </Link>

          {/* Right actions: Notification Bell, Calendar (between bell and user logo), and Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 relative" ref={profileMenuRef}>
            {/* Notification Bell */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-2xs text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Calendar Button (in between Notification Bell and Profile Avatar) */}
            <Link
              href="/calendar"
              className={`w-9 h-9 rounded-full border shadow-2xs flex items-center justify-center transition-colors ${
                isCalendarActive
                  ? "bg-purple-50/80 border-2 border-purple-600 text-purple-700 shadow-2xs font-bold"
                  : "bg-white border-slate-200/80 text-slate-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/40"
              }`}
              title="Calendar View"
            >
              <CalendarDays className="w-4 h-4" />
            </Link>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-[#351e5e] text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer"
              title="Profile & Settings"
            >
              {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
            </button>

            {/* User Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Bar (White Theme, Center Plus) */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pb-2.5 sm:pb-4 pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-[380px] sm:max-w-md bg-white text-slate-500 rounded-2xl sm:rounded-3xl px-2 py-1.5 sm:px-3 sm:py-2 shadow-xl shadow-slate-900/10 border border-slate-200/90 flex items-center justify-between">
          {/* Left 2 Items: Home, Expenses */}
          <div className="flex items-center justify-around flex-1 gap-1">
            {leftNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center transition-all ${
                    item.isActive
                      ? "border-2 border-purple-600 text-purple-700 bg-purple-50/70 font-bold px-2 py-1 rounded-xl shadow-2xs w-full max-w-[56px]"
                      : "border-2 border-transparent text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/40 px-2 py-1 rounded-xl w-full max-w-[52px]"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center Quick Add Action (+) - Border Design */}
          <div className="shrink-0 px-2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-purple-600 text-purple-700 bg-purple-50/70 hover:bg-purple-100 hover:border-purple-700 flex items-center justify-center shadow-2xs transition-transform active:scale-95 cursor-pointer"
              title="Quick Add Expense"
              aria-label="Quick Add Expense"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Right 2 Items: Budgets, Category */}
          <div className="flex items-center justify-around flex-1 gap-1">
            {rightNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center transition-all ${
                    item.isActive
                      ? "border-2 border-purple-600 text-purple-700 bg-purple-50/70 font-bold px-2 py-1 rounded-xl shadow-2xs w-full max-w-[56px]"
                      : "border-2 border-transparent text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/40 px-2 py-1 rounded-xl w-full max-w-[52px]"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Global Quick Add Expense Modal */}
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
