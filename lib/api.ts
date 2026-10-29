import {
  ApiResponse,
  User,
  Expense,
  Category,
  Budget,
  DashboardOverview,
  DaySpendingSummary,
  MonthSpendingSummary,
  CalendarMonthResponse,
} from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  public setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  public clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private getTimezoneOffset(): string {
    return String(-new Date().getTimezoneOffset());
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone-offset": this.getTimezoneOffset(),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "omit", // Using Authorization Bearer header
    });

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      message: "An unexpected server response occurred",
      data: null as any,
    }));

    if (!response.ok || !data.success) {
      if (response.status === 401 && typeof window !== "undefined") {
        this.clearToken();
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")
        ) {
          window.location.href = "/login";
        }
      }
      const errorMessage =
        data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  }

  // Auth Endpoints
  auth = {
    register: (payload: { name: string; email: string; password: string }) =>
      this.request<{ user: User; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    login: (payload: { email: string; password: string }) =>
      this.request<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    logout: () =>
      this.request<null>("/auth/logout", {
        method: "POST",
      }),

    me: () => this.request<User>("/auth/me"),
  };

  // Category Endpoints
  categories = {
    list: () => this.request<Category[]>("/categories"),

    create: (payload: { name: string; icon?: string; color?: string }) =>
      this.request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (
      id: string,
      payload: { name?: string; icon?: string; color?: string }
    ) =>
      this.request<Category>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string, reassignTo?: string) => {
      const query = reassignTo ? `?reassignTo=${encodeURIComponent(reassignTo)}` : "";
      return this.request<{ deletedCategoryId: string }>(`/categories/${id}${query}`, {
        method: "DELETE",
      });
    },
  };

  // Expense Endpoints
  expenses = {
    list: (params: Record<string, string> = {}) => {
      const searchParams = new URLSearchParams(params).toString();
      const endpoint = searchParams ? `/expenses?${searchParams}` : "/expenses";
      return this.request<Expense[]>(endpoint);
    },

    create: (payload: {
      amountPaise: number;
      categoryId: string;
      description?: string;
      type?: "expense" | "income";
      date?: string;
      paymentMethod?: string;
    }) =>
      this.request<Expense>("/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (
      id: string,
      payload: {
        amountPaise?: number;
        categoryId?: string;
        description?: string;
        type?: "expense" | "income";
        date?: string;
        paymentMethod?: string;
      }
    ) =>
      this.request<Expense>(`/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      this.request<{ deletedExpenseId: string }>(`/expenses/${id}`, {
        method: "DELETE",
      }),
  };

  // Budget Endpoints
  budgets = {
    list: (params: { period?: "daily" | "monthly"; applicablePeriod?: string } = {}) => {
      const searchParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const endpoint = searchParams ? `/budgets?${searchParams}` : "/budgets";
      return this.request<Budget[]>(endpoint);
    },

    create: (payload: {
      categoryId?: string | null;
      period: "daily" | "monthly";
      limitPaise: number;
      applicablePeriod: string;
      alertThreshold?: number;
    }) =>
      this.request<Budget>("/budgets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (
      id: string,
      payload: { limitPaise?: number; alertThreshold?: number }
    ) =>
      this.request<Budget>(`/budgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      this.request<{ deletedBudgetId: string }>(`/budgets/${id}`, {
        method: "DELETE",
      }),
  };

  // Dashboard Endpoints
  dashboard = {
    overview: () => this.request<DashboardOverview>("/dashboard/overview"),

    daily: (date?: string) => {
      const query = date ? `?date=${encodeURIComponent(date)}` : "";
      return this.request<DaySpendingSummary>(`/dashboard/daily${query}`);
    },

    monthly: (year?: number, month?: number) => {
      const params = new URLSearchParams();
      if (year) params.append("year", String(year));
      if (month) params.append("month", String(month));
      const query = params.toString() ? `?${params.toString()}` : "";
      return this.request<MonthSpendingSummary>(`/dashboard/monthly${query}`);
    },
  };

  // Calendar Endpoints
  calendar = {
    month: (year?: number, month?: number) => {
      const params = new URLSearchParams();
      if (year) params.append("year", String(year));
      if (month) params.append("month", String(month));
      const query = params.toString() ? `?${params.toString()}` : "";
      return this.request<CalendarMonthResponse>(`/calendar/month${query}`);
    },

    day: (date: string) =>
      this.request<{
        date: string;
        totalExpensePaise: number;
        totalIncomePaise: number;
        transactions: Expense[];
      }>(`/calendar/day?date=${encodeURIComponent(date)}`),
  };
}

export const api = new ApiClient();

