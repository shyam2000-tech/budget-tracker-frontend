"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const AppLayout = ({ children, onRefresh }: AppLayoutProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfe]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading KashKutie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfe] text-slate-900">
      <Navbar onExpenseAdded={onRefresh} />
      <main className="flex-1 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl w-full mx-auto px-3.5 sm:px-6 pt-1 pb-24 sm:pb-28">
        {children}
      </main>
    </div>
  );
};
