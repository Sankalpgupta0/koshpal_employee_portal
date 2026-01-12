import { axiosInstance } from './axiosInstance';

export interface CoachSlot {
  slotId: string;
  startTime: string; // ISO string in UTC
  endTime: string; // ISO string in UTC
  slotDate: string; // YYYY-MM-DD in IST
  status: string;
}

export interface CoachWithSlots {
  coachId: string;
  coachName: string;
  expertise: string[];
  slots: CoachSlot[];
}

export interface AvailableDates {
  [date: string]: {
    hasSlots: boolean;
    slotCount: number;
  };
}

/**
 * NEW API: Get all coach slots for a specific IST date
 * Uses: /employee/slots?date=YYYY-MM-DD
 */
export const getSlotsByDate = async (date: string): Promise<CoachWithSlots[]> => {
  const response = await axiosInstance.get('/employee/slots', {
    params: { date },
  });
  return response.data;
};

/**
 * NEW API: Get slots for a specific coach on a specific IST date
 * Uses: /employee/slots/coach/:coachId?date=YYYY-MM-DD
 */
export const getSlotsByCoachAndDate = async (
  coachId: string,
  date: string,
): Promise<CoachWithSlots> => {
  const response = await axiosInstance.get(
    `/employee/slots/coach/${coachId}`,
    {
      params: { date },
    },
  );
  return response.data;
};

/**
 * NEW API: Get available dates in a range for calendar
 * Uses: /employee/slots/calendar?startDate=X&endDate=Y&coachId=Z
 */
export const getAvailableDates = async (
  startDate: string,
  endDate: string,
  coachId?: string,
): Promise<AvailableDates> => {
  const response = await axiosInstance.get('/employee/slots/calendar', {
    params: { startDate, endDate, coachId },
  });
  return response.data;
};

// OLD APIs - kept for backward compatibility
export const getCoachSlots = async (date: string): Promise<CoachWithSlots[]> => {
  const response = await axiosInstance.get('/employee/coaches/slots', {
    params: { date },
  });
  return response.data;
};

export const getSlotAvailabilityForRange = async (
  startDate: string,
  endDate: string,
  coachId?: string,
): Promise<AvailableDates> => {
  const response = await axiosInstance.get('/employee/coaches/slots/range', {
    params: { startDate, endDate, coachId },
  });
  return response.data;
};
