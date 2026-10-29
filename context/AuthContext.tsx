"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "../types";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.me();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          api.clearToken();
          setUser(null);
        }
      } catch {
        api.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setUser(res.data.user);
      router.push("/dashboard");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setUser(res.data.user);
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      api.clearToken();
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

