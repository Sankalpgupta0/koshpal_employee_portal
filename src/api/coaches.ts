import { axiosInstance } from './axiosInstance';

export interface Coach {
  id: string;
  email: string;
  fullName: string;
  expertise: string[];
  bio: string;
  rating: number;
  successRate: number;
  clientsHelped: number;
  location: string;
  languages: string[];
  profilePhoto?: string;
}

export interface CoachSlot {
  id: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
}

export interface Consultation {
  id: string;
  meetingLink: string;
  status: 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
  };
  coach: {
    id: string;
    email: string;
    fullName: string;
    expertise: string[];
    rating: number;
    location: string;
    profilePhoto?: string;
  };
}

export interface ConsultationStats {
  total: number;
  past: number;
  upcoming: number;
  thisWeek: number;
  thisMonth: number;
  minutesBooked: number;
  confirmed: number;
  cancelled: number;
}

/**
 * Get all available coaches
 * GET /api/v1/employee/coaches
 */
export const getCoaches = async (): Promise<Coach[]> => {
  const response = await axiosInstance.get('/employee/coaches');
  return response.data;
};

/**
 * Get slots for a specific coach on a specific date
 * GET /api/v1/employee/coaches/:coachId/slots
 */
export const getCoachSlots = async (coachId: string, date: string): Promise<CoachSlot[]> => {
  const response = await axiosInstance.get(`/employee/coaches/${coachId}/slots`, {
    params: { date },
  });
  return response.data;
};

/**
 * Book a consultation session
 * POST /api/v1/employee/consultations/book
 */
export const bookConsultation = async (data: {
  slotId: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/employee/consultations/book', data);
  return response.data;
};

/**
 * Get employee's consultations with optional filter
 * GET /api/v1/employee/consultations
 * @param filter - Optional filter: 'past' | 'upcoming' | 'thisWeek' | 'thisMonth'
 */
export const getMyConsultations = async (filter?: string): Promise<Consultation[]> => {
  const response = await axiosInstance.get('/employee/consultations', {
    params: filter ? { filter } : {},
  });
  return response.data;
};

/**
 * Get employee's consultation statistics
 * GET /api/v1/employee/consultations/stats
 */
export const getMyConsultationStats = async (): Promise<ConsultationStats> => {
  const response = await axiosInstance.get('/employee/consultations/stats');
  return response.data;
};

/**
 * Get employee's latest consultation
 * GET /api/v1/employee/consultations/latest
 */
export const getMyLatestConsultation = async (): Promise<Consultation | null> => {
  const response = await axiosInstance.get('/employee/consultations/latest');
  return response.data;
};
