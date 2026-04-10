import { axiosInstance } from './axiosInstance';

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  companyId: string;
  role: string;
  department?: string;
  salary?: number;
  budget?: number;
  dateJoined?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: Employee;
}

export interface ForgotPasswordResponse {
  message: string;
  token?: string;
}

export interface CreateEmployeeRequest {
  companyId: string;
  name?: string;
  email: string;
  phone?: string;
  password: string;
  salary?: number;
  budget?: number;
  department?: string;
  dateJoined?: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  salary?: number;
  budget?: number;
  department?: string;
  spendSummary?: {
    totalSpend?: number;
    categories?: Record<string, number>;
  };
}

// get emp latest consulatation
// get - api/v1/employee/consultations/latest
export const getEmployeeLatestConsultation = async () => {
  const response = await axiosInstance.get('/employee/consultations/latest');
  return response.data;
};

// ==================== Employee API ====================

/**
 * Employee login - now uses httpOnly cookies
 */
export const loginEmployee = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    // Backend now sets httpOnly cookies, response only contains user data
    const { user } = response.data;
    
    return {
      message: 'Login successful',
      user: {
        _id: user.id,
        name: user.name || user.email,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Request OTP for password reset
 */
export const forgotPasswordEmployee = async (email: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/forgot-password', {
    email,
    portal: 'EMPLOYEE',
  });
  return response.data;
};

/**
 * Verify OTP for password reset
 */
export const verifyOtpEmployee = async (
  email: string,
  otp: string,
): Promise<{ message: string; tempToken: string }> => {
  const response = await axiosInstance.post('/auth/verify-otp', {
    email,
    otp,
  });
  return response.data;
};

/**
 * Reset password using temporary token from verifyOtp
 */
export const resetPasswordOtpEmployee = async (
  tempToken: string,
  newPassword: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/auth/reset-password/${tempToken}`, {
    newPassword,
  });
  return response.data;
};

/**
 * Change password for authenticated user
 */
export const changePasswordEmployee = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.patch('/auth/me/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Create new employee
 */
export const createEmployee = async (data: CreateEmployeeRequest) => {
  const response = await axiosInstance.post('/employee', data);
  return response.data;
};

/**
 * Get all employees (with pagination)
 */
export const getEmployees = async (companyId: string, page = 1, limit = 10) => {
  const response = await axiosInstance.get('/employee', {
    params: { page, limit },
    data: { companyId },
  });
  return response.data;
};

/**
 * Get employee by ID (use auth/me for current user)
 */
// export const getEmployeeById = async (): Promise<Employee> => {
//   const response = await axiosInstance.get('/auth/me');
//   const user = response.data;
//   return {
//     _id: user.userId,
//     name: user.email,
//     email: user.email,
//     companyId: user.companyId || '',
//     role: user.role,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };
// };

/**
 * Update employee details
 */
export const updateEmployee = async (employeeId: string, updates: UpdateEmployeeRequest) => {
  const response = await axiosInstance.put(`/employee/${employeeId}`, updates);
  return response.data;
};


export const updateMyProfile = async (data: FormData) => {
  return axiosInstance.put('/employee/profile', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export const getMyProfile = async () => {
  const res = await axiosInstance.get('/employee/profile');
  return res.data;
};

/**
 * Delete employee
 */
export const deleteEmployee = async (employeeId: string) => {
  const response = await axiosInstance.delete(`/employee/${employeeId}`);
  return response.data;
};
