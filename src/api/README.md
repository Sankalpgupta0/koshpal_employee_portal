# API Documentation

This folder contains all API functions organized by feature. All functions use the centralized `axiosInstance` with automatic token handling and error interceptors.

## Structure

```
api/
├── axiosInstance.ts      # Axios configuration with interceptors
├── financialGoals.ts     # Financial goals API functions
├── employee.ts           # Employee API functions
├── transactions.ts       # Transactions API functions
└── index.ts              # Exports all API functions
```

## Usage

### Import API Functions

```typescript
// Import specific functions
import { getFinancialGoalsByEmployeeId, addGoal } from '@/api';

// Or import from specific module
import { loginEmployee, getEmployeeById } from '@/api/employee';
```

### Financial Goals API

```typescript
import {
  createFinancialGoals,
  getFinancialGoalsByEmployeeId,
  updateFinancialGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  deleteFinancialGoals,
} from '@/api';

// Get goals for an employee
const goals = await getFinancialGoalsByEmployeeId(employeeId);

// Add a single goal
await addGoal(employeeId, {
  goalName: 'Buy a car',
  icon: '🚗',
  goalAmount: 50000,
  goalDate: '2025-12-31',
  saving: 0,
});

// Update a specific goal
await updateGoal(employeeId, goalId, {
  saving: 5000,
});

// Delete a goal
await deleteGoal(employeeId, goalId);
```

### Employee API

```typescript
import { loginEmployee, getEmployeeById, updateEmployee } from '@/api';

// Login
const response = await loginEmployee({
  email: 'user@example.com',
  password: 'password123',
});
// Store token and user data
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.employee));

// Get employee details
const employee = await getEmployeeById(employeeId);

// Update employee
await updateEmployee(employeeId, {
  name: 'John Doe',
  budget: 5000,
});
```

### Transactions API

```typescript
import {
  getTransactionsByEmployeeId,
  getEmployeeTransactionSummary,
  addTransaction,
  bulkAddTransactions,
  recalculateSpendingSummary,
} from '@/api';

// Get all transactions for an employee
const transactions = await getTransactionsByEmployeeId(employeeId, {
  limit: 50,
  skip: 0,
  txnType: 'DEBIT', // Optional: filter by CREDIT or DEBIT
  startDate: '2025-01-01', // Optional
  endDate: '2025-12-31', // Optional
});
console.log(transactions.data); // Array of transactions

// Get transaction summary
const summary = await getEmployeeTransactionSummary(employeeId);
console.log(summary.data.totalIncome);
console.log(summary.data.totalSpending);
console.log(summary.data.monthlyData);

// Add a single transaction
await addTransaction({
  employeeId,
  amount: 5000,
  txn_type: 'DEBIT',
  merchant: 'Amazon',
  category_name: 'Shopping',
  transactionDate: '2025-10-15',
});

// Bulk add transactions
await bulkAddTransactions({
  employeeId,
  transactions: [
    { amount: 100, txn_type: 'DEBIT', merchant: 'Starbucks' },
    { amount: 5000, txn_type: 'CREDIT', merchant: 'Salary' },
  ],
});

// Recalculate spending summary
await recalculateSpendingSummary(employeeId);
```

## Axios Instance

The `axiosInstance` is pre-configured with:

- **Base URL**: Automatically uses `VITE_API_URL` from environment variables
- **Timeout**: 10 seconds
- **Auth Token**: Automatically adds token from localStorage to all requests
- **Error Handling**: Redirects to login on 401 Unauthorized

### Custom Requests

If you need to make custom API calls:

```typescript
import { axiosInstance } from '@/api';

const response = await axiosInstance.get('/custom-endpoint');
const data = await axiosInstance.post('/custom-endpoint', { data: 'value' });
```

## Error Handling

All API functions throw errors that can be caught:

```typescript
try {
  const goals = await getFinancialGoalsByEmployeeId(employeeId);
} catch (error: any) {
  console.error('Error:', error.response?.data?.error || error.message);
  // Handle error appropriately
}
```

## TypeScript Types

All API functions include TypeScript types for requests and responses:

```typescript
import type { Goal, FinancialGoalsResponse, AddGoalRequest } from '@/api';

const goal: Goal = {
  goalName: 'Vacation',
  icon: '✈️',
  goalAmount: 10000,
  saving: 2000,
  goalDate: '2025-06-30',
};
```

## Environment Variables

Make sure to set the following in your `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```
