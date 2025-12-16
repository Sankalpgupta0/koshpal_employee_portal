import { axiosInstance } from './axiosInstance';

export interface MonthlySummary {
  id: string;
  userId: string;
  companyId: string;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpense: number;
  savings: number;
  budget: number;
  categoryBreakdown: Record<string, number>;
  createdAt: string;
}

export interface MonthlySummaryResponse {
  success?: boolean;
  data?: MonthlySummary;
}

// ==================== Insights API ====================

/**
 * Get latest monthly summary for current user
 * GET /api/v1/insights/monthly/latest
 */
export const getLatestMonthlySummary = async (): Promise<MonthlySummaryResponse> => {
  const response = await axiosInstance.get('/insights/monthly/latest');
  return response.data;
};

/**
 * Get monthly summaries with optional filters
 * GET /api/v1/insights/monthly
 */
export const getMonthlySummaries = async (params?: {
  year?: number;
  month?: number;
}): Promise<{ data: MonthlySummary[] }> => {
  const response = await axiosInstance.get('/insights/monthly', { params });
  return response.data;
};

/**
 * Get category breakdown
 * GET /api/v1/insights/category-breakdown
 */
export const getCategoryBreakdown = async (params?: {
  year?: number;
  month?: number;
}): Promise<{ categoryBreakdown: Record<string, number> }> => {
  const response = await axiosInstance.get('/insights/category-breakdown', { params });
  return response.data;
};

/**
 * Get spending trends
 * GET /api/v1/insights/trends
 */
export const getSpendingTrends = async (months?: number): Promise<{
  period: string;
  trends: Array<{
    period: string;
    year: number;
    month: number;
    totalIncome: number;
    totalExpense: number;
    savings: number;
    savingsRate: number;
  }>;
  averages: {
    income: number;
    expense: number;
    savings: number;
    savingsRate: number;
  };
}> => {
  const response = await axiosInstance.get('/insights/trends', {
    params: { months },
  });
  return response.data;
};

/**
 * Update budget for a specific month
 * PATCH /api/v1/insights/budget
 */
export const updateBudget = async (data: {
  month: number;
  year: number;
  budget: number;
}): Promise<{ data: MonthlySummary }> => {
  const response = await axiosInstance.patch('/insights/budget', data);
  return response.data;
};

/**
 * Get budget for a specific month
 * GET /api/v1/insights/budget
 */
export const getBudget = async (params: {
  month: number;
  year: number;
}): Promise<{ month: number; year: number; budget: number }> => {
  const response = await axiosInstance.get('/insights/budget', { params });
  return response.data;
};
