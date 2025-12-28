import { axiosInstance } from './axiosInstance';

export interface Goal {
  _id?: string;
  goalName: string;
  icon: string;
  goalAmount: number;
  saving: number;
  goalDate: string;
}

export interface FinancialGoalsResponse {
  _id: string;
  employeeId: string;
  financialGoals: Goal[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalsRequest {
  employeeId: string;
  financialGoals: Omit<Goal, '_id'>[];
}

export interface AddGoalRequest {
  goalName: string;
  icon: string;
  goalAmount: number;
  goalDate: string;
  saving?: number;
}

export interface UpdateGoalRequest {
  goalName?: string;
  icon?: string;
  goalAmount?: number;
  goalDate?: string;
  saving?: number;
}

// ==================== Financial Goals API ====================

/**
 * Create financial goals for an employee (not used - use addGoal instead)
 */
export const createFinancialGoals = async () => {
  // This endpoint doesn't exist in backend, use addGoal instead
  throw new Error('Use addGoal instead');
};

/**
 * Get financial goals by employee ID (for current user)
 */
export const getFinancialGoalsByEmployeeId = async (): Promise<FinancialGoalsResponse> => {
  const response = await axiosInstance.get('/employee/goals');
  return response.data;
};

/**
 * Update all financial goals for an employee (not used - use updateGoal instead)
 */
export const updateFinancialGoals = async () => {
  // This endpoint doesn't exist in backend, use updateGoal instead
  throw new Error('Use updateGoal instead');
};

/**
 * Add a single goal to existing financial goals
 */
export const addGoal = async (goal: AddGoalRequest) => {
  const response = await axiosInstance.post('/employee/goals', goal);
  return response.data;
};

/**
 * Update a specific goal
 */
export const updateGoal = async (goalId: string, updates: UpdateGoalRequest) => {
  const response = await axiosInstance.put(`/employee/goals/${goalId}`, updates);
  return response.data;
};

/**
 * Delete a specific goal
 */
export const deleteGoal = async (goalId: string) => {
  const response = await axiosInstance.delete(`/employee/goals/${goalId}`);
  return response.data;
};

/**
 * Delete all financial goals for an employee (not implemented)
 */
export const deleteFinancialGoals = async () => {
  throw new Error('Not implemented in backend');
};
