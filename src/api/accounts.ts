import { axiosInstance } from './axiosInstance';

export type AccountType = 'BANK' | 'CASH' | 'WALLET' | 'CREDIT_CARD';

export interface Account {
  id: string;
  userId: string;
  companyId: string;
  type: AccountType;
  provider?: string;
  maskedAccountNo?: string;
  createdAt: string;
  balance?: number; // Will be calculated from transactions
  _count?: {
    transactions: number;
  };
}

export interface CreateAccountRequest {
  type: AccountType;
  provider?: string;
  maskedAccountNo?: string;
}

export interface UpdateAccountRequest {
  type?: AccountType;
  provider?: string;
  maskedAccountNo?: string;
}

// ==================== Account API ====================

/**
 * Get all accounts for logged-in employee
 * GET /api/v1/employee/accounts
 */
export const getAccounts = async (): Promise<Account[]> => {
  const response = await axiosInstance.get('/employee/accounts');
  return response.data;
};

/**
 * Create new account
 * POST /api/v1/employee/accounts
 */
export const createAccount = async (data: CreateAccountRequest): Promise<Account> => {
  const response = await axiosInstance.post('/employee/accounts', data);
  return response.data;
};

/**
 * Update account
 * PATCH /api/v1/employee/accounts/:id
 */
export const updateAccount = async (
  id: string,
  data: UpdateAccountRequest
): Promise<Account> => {
  const response = await axiosInstance.patch(`/employee/accounts/${id}`, data);
  return response.data;
};

/**
 * Delete account
 * DELETE /api/v1/employee/accounts/:id
 */
export const deleteAccount = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/employee/accounts/${id}`);
};
