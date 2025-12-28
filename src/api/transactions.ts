import { axiosInstance } from './axiosInstance';

export interface MonthlyData {
  month: string;
  income: number;
  spending: number;
  savings: number;
  transactionCount: number;
  categories?: Record<string, number>;
}

export interface LargestTransaction {
  amount: number;
  merchant: string | null;
  date: string;
  type: 'CREDIT' | 'DEBIT';
}

export interface SpendingSummary {
  employeeId: string;
  totalIncome: number;
  totalSpending: number;
  netSavings: number;
  savingsRate: number;
  categories: Record<string, number>;
  monthlyData: MonthlyData[];
  totalTransactions: number;
  largestTransaction: LargestTransaction;
  mostFrequentCategory: string | null;
  averageMonthlyIncome?: number;
  averageMonthlySpending?: number;
  lastCalculated: string;
}

export interface Transaction {
  _id: string;
  employeeId: string;
  transactionId?: string;
  sender?: string;
  messageBody?: string;
  amount: number;
  currency: string;
  txnType: 'CREDIT' | 'DEBIT';
  timestampMs?: number;
  transactionDate: string;
  accountLast4?: string;
  merchant?: string;
  categoryId?: string;
  categoryName?: string;
  upiRef?: string;
  bank?: string;
  isStarred: boolean;
  includeInCashFlow: boolean;
  source: string;
  appVersion?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummaryResponse {
  success: boolean;
  data: SpendingSummary;
}

export interface TransactionsResponse {
  success: boolean;
  count: number;
  data: Transaction[];
}

export interface AddTransactionRequest {
  employeeId: string;
  transaction_id?: string;
  sender?: string;
  message_body?: string;
  amount: number;
  currency?: string;
  txn_type?: 'CREDIT' | 'DEBIT';
  timestamp_ms?: number;
  transactionDate?: string;
  account_last4?: string;
  merchant?: string;
  category_id?: string;
  category_name?: string;
  upi_ref?: string;
  bank?: string;
  is_starred?: boolean;
  include_in_cash_flow?: boolean;
  source?: string;
  app_version?: string;
  device_id?: string;
}

export interface BulkAddTransactionsRequest {
  employeeId: string;
  transactions: AddTransactionRequest[];
}

export interface GetTransactionsParams {
  startDate?: string;
  endDate?: string;
  txnType?: 'CREDIT' | 'DEBIT';
  categoryId?: string;
  limit?: number;
  skip?: number;
}

// ==================== Transactions API ====================

/**
 * Get transactions by employee ID (uses current user from token)
 * GET /api/v1/employee/transactions
 */
export const getTransactionsByEmployeeId = async (
  params?: GetTransactionsParams
): Promise<TransactionsResponse> => {
  const response = await axiosInstance.get('/employee/transactions', { params });
  // Map backend response to frontend format
  return {
    success: true,
    count: response.data.length,
    data: response.data.map((t: any) => ({
      _id: t.id,
      employeeId: t.userId,
      amount: Number(t.amount),
      currency: 'INR',
      txnType: t.type === 'INCOME' ? 'CREDIT' : 'DEBIT',
      transactionDate: t.transactionDate,
      merchant: t.description,
      categoryName: t.category,
      isStarred: false,
      includeInCashFlow: true,
      source: t.source,
      createdAt: t.createdAt,
      updatedAt: t.createdAt,
    })),
  };
};

/**
 * Get employee transaction summary (insights)
 * GET /api/v1/employee/insights/summary
 */
export const getEmployeeTransactionSummary = async (): Promise<TransactionSummaryResponse> => {
  const response = await axiosInstance.get('/employee/insights/summary');
  return {
    success: true,
    data: response.data,
  };
};

/**
 * Add a single transaction
 * POST /api/v1/employee/transactions
 */
export const addTransaction = async (data: AddTransactionRequest) => {
  const backendData = {
    accountId: data.employeeId, // Will need to map to actual account
    amount: data.amount,
    type: data.txn_type === 'CREDIT' ? 'INCOME' : 'EXPENSE',
    category: data.category_name || 'Other',
    description: data.merchant || data.message_body,
    source: data.source || 'MANUAL',
    transactionDate: data.transactionDate || new Date().toISOString(),
  };
  const response = await axiosInstance.post('/employee/transactions', backendData);
  return response.data;
};

/**
 * Bulk add transactions (not implemented in backend)
 * POST /api/transactions/bulk
 */
export const bulkAddTransactions = async () => {
  throw new Error('Bulk transactions not implemented in backend yet');
};

/**
 * Recalculate spending summary for an employee (not needed - backend auto-calculates)
 * POST /api/transactions/:employeeId/recalculate
 */
export const recalculateSpendingSummary = async () => {
  // Backend auto-calculates, this is a no-op
  return { message: 'Backend auto-calculates summaries' };
};
