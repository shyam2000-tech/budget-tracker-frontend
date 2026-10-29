export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  categoryId: Category | string;
  amountPaise: number;
  description: string;
  type: "expense" | "income";
  date: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  } | null;
  period: "daily" | "monthly";
  limitPaise: number;
  applicablePeriod: string;
  alertThreshold: number;
  spentPaise: number;
  remainingPaise: number;
  percentageConsumed: number;
  isWarning: boolean;
  isExceeded: boolean;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  totalPaise: number;
  percentage: number;
}

export interface DaySpendingSummary {
  date: string;
  totalExpensePaise: number;
  totalIncomePaise: number;
  transactionCount: number;
  categoryBreakdown: CategorySpending[];
}

export interface MonthSpendingSummary {
  year: number;
  month: number;
  totalExpensePaise: number;
  totalIncomePaise: number;
  netSavingsPaise: number;
  dailyAveragePaise: number;
  categoryBreakdown: CategorySpending[];
  dailyTrend: { date: string; totalPaise: number }[];
}

export interface DashboardOverview {
  todayExpensePaise: number;
  monthExpensePaise: number;
  monthIncomePaise: number;
  netSavingsPaise: number;
  recentTransactions: Expense[];
  topCategories: CategorySpending[];
  budgetSummary: {
    totalBudgetPaise: number;
    totalSpentPaise: number;
    percentageConsumed: number;
  } | null;
}

export interface CalendarDaySummary {
  date: string;
  totalSpendingPaise: number;
  transactionCount: number;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  days: Record<string, CalendarDaySummary>;
  monthlyTotalPaise: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any;
}

