/**
 * Timezone Utility - Frontend (UTC ↔ Asia/Kolkata conversion)
 *
 * Frontend mirror of backend timezone utility.
 * All timestamps from API are in UTC.
 * This utility converts them to IST for display and filtering.
 *
 * CRITICAL RULES:
 * 1. Always convert startTime/endTime UTC timestamps to IST before grouping
 * 2. Always use backend-provided slotDate field for filtering (YYYY-MM-DD in IST)
 * 3. Never compare raw UTC timestamps with user-selected dates
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert UTC timestamp to IST date (YYYY-MM-DD)
 * This matches what the backend returns in slotDate field
 *
 * @param utcDateString - ISO date string from API (UTC)
 * @returns Date string in YYYY-MM-DD format (IST)
 */
export function convertUTCToISTDate(utcDateString: string): string {
  const date = new Date(utcDateString);
  const istDate = new Date(
    date.toLocaleString('en-US', { timeZone: IST_TIMEZONE })
  );

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format UTC timestamp to IST readable time (e.g., "03:00 PM")
 *
 * @param utcDateString - ISO date string from API (UTC)
 * @returns Formatted time string
 */
export function formatUTCToISTTime(utcDateString: string): string {
  const date = new Date(utcDateString);
  const istDate = new Date(
    date.toLocaleString('en-US', { timeZone: IST_TIMEZONE })
  );

  return istDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format UTC timestamp to readable IST date and time (e.g., "13 Jan 2026, 03:00 PM IST")
 *
 * @param utcDateString - ISO date string from API (UTC)
 * @returns Formatted date and time string
 */
export function formatUTCToISTDateTime(utcDateString: string): string {
  const date = new Date(utcDateString);
  const istDate = new Date(
    date.toLocaleString('en-US', { timeZone: IST_TIMEZONE })
  );

  return istDate.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get current date in IST (YYYY-MM-DD)
 *
 * @returns Current date in IST format
 */
export function getTodayDateInIST(): string {
  return convertUTCToISTDate(new Date().toISOString());
}

/**
 * Convert JavaScript Date object to YYYY-MM-DD string (using local browser timezone)
 * Used for calendar date selection
 *
 * @param date - JavaScript Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function dateToISTDateString(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * CRITICAL: Filter slots to only those on the selected date
 * Always use slotDate from API instead of converting raw timestamps
 *
 * @param slots - Array of slots with slotDate field
 * @param selectedDateStr - Selected date in YYYY-MM-DD format
 * @returns Filtered slots for the selected date
 */
export function filterSlotsByDate<T extends { slotDate?: string }>(
  slots: T[],
  selectedDateStr: string
): T[] {
  return slots.filter((slot) => slot.slotDate === selectedDateStr);
}

/**
 * Group slots by their slotDate (IST)
 * This ensures correct date grouping regardless of UTC timestamp
 *
 * @param slots - Array of slots with slotDate field
 * @returns Object mapping date strings to slots
 */
export function groupSlotsByDate<T extends { slotDate?: string }>(
  slots: T[]
): Record<string, T[]> {
  return slots.reduce(
    (acc, slot) => {
      const date = slot.slotDate || '';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Get all unique dates from slots (useful for calendar highlighting)
 *
 * @param slots - Array of slots with slotDate field
 * @returns Set of unique date strings (YYYY-MM-DD)
 */
export function getUniqueSlotsDateSet<T extends { slotDate?: string }>(
  slots: T[]
): Set<string> {
  return new Set(slots.map((slot) => slot.slotDate || '').filter(Boolean));
}

/**
 * Format time range for display (e.g., "03:00 PM - 04:00 PM IST")
 *
 * @param startTimeUTC - Start time ISO string (UTC)
 * @param endTimeUTC - End time ISO string (UTC)
 * @returns Formatted time range
 */
export function formatTimeRange(startTimeUTC: string, endTimeUTC: string): string {
  const start = formatUTCToISTTime(startTimeUTC);
  const end = formatUTCToISTTime(endTimeUTC);
  return `${start} - ${end} IST`;
}
