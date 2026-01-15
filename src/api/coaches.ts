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

/**
 * CRITICAL: Slot interface with timezone-aware slotDate field.
 * - startTime/endTime are ISO UTC timestamps
 * - slotDate is the YYYY-MM-DD date in Asia/Kolkata timezone
 * - Always use slotDate for filtering and matching against calendar dates
 */
export interface CoachSlot {
  id: string;
  coachId: string;
  date: string;
  startTime: string; // ISO UTC timestamp
  endTime: string; // ISO UTC timestamp
  slotDate?: string; // YYYY-MM-DD in IST (from backend)
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
}

/**
 * CRITICAL: Slots from getAllCoachSlots endpoint now include slotDate
 */
export interface CoachWithSlots {
  coachId: string;
  coachName: string;
  expertise: string[];
  slots: Array<{
    slotId: string;
    startTime: string; // ISO UTC timestamp
    endTime: string; // ISO UTC timestamp
    slotDate?: string; // YYYY-MM-DD in IST (NEW: from backend)
    status?: string;
  }>;
}

export interface Consultation {
  id: string;
  meetingLink: string;
  notes?: string;
  status: 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    slotDate?: string; // YYYY-MM-DD in IST
    status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
  };
  coach: {
    id: string;
    email: string;
    fullName: string;
    expertise: string[];
    bio?: string;
    rating: number;
    successRate?: number;
    clientsHelped?: number;
    location: string;
    languages?: string[];
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
 * @deprecated Use getAllCoachSlots for better performance
 */
export const getCoachSlots = async (coachId: string, date: string): Promise<CoachSlot[]> => {
  const response = await axiosInstance.get(`/employee/coaches/${coachId}/slots`, {
    params: { date },
  });
  return response.data;
};

/**
 * Get all coach slots aggregated for a specific date (OPTIMIZED)
 * GET /api/v1/employee/coaches/slots?date=YYYY-MM-DD
 * Returns all active coaches with their available slots in a single request
 */
export const getAllCoachSlots = async (date: string): Promise<CoachWithSlots[]> => {
  const response = await axiosInstance.get('/employee/coaches/slots', {
    params: { date },
  });
  return response.data;
};

/**
 * Get slot availability for date range (OPTIMIZED for calendar)
 * GET /api/v1/employee/coaches/slots/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&coachId=uuid
 * Returns a map of dates to availability status - single request for entire month
 */
export const getSlotAvailabilityRange = async (
  startDate: string,
  endDate: string,
  coachId?: string,
): Promise<Record<string, { hasSlots: boolean; slotCount: number }>> => {
  const response = await axiosInstance.get('/employee/coaches/slots/range', {
    params: { startDate, endDate, coachId },
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
}): Promise<{
  message: string;
  booking: {
    id: string;
    meetingLink: string;
    calendarEventId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
  };
}> => {
  const response = await axiosInstance.post('/employee/consultations/book', data);
  return response.data;
};

/**
 * Get employee's consultations with optional filter
 * GET /api/v1/employee/consultations
 * @param filter - Optional filter: 'past' | 'upcoming' | 'thisWeek' | 'thisMonth'
 */
export const getMyConsultations = async (filter?: string, startDate?: string, endDate?: string): Promise<Consultation[]> => {
  const params: any = {};
  if (filter) params.filter = filter;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await axiosInstance.get('/employee/consultations', { params });
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

/**
 * Get consultation details by ID
 * GET /api/v1/employee/consultations/:id
 */
export const getConsultationDetails = async (id: string): Promise<Consultation> => {
  const response = await axiosInstance.get(`/employee/consultations/${id}`);
  return response.data;
};
