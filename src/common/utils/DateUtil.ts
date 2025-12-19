export const DateUtil = {
  /**
   * Checks if a date is in the past
   * @param date - The date to check
   * @returns true if the date is in the past, false otherwise
   */
  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  },

  /**
   * Checks if a date is in the future
   * @param date - The date to check
   * @returns true if the date is in the future, false otherwise
   */
  isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  },

  /**
   * Checks if a date is today
   * @param date - The date to check
   * @returns true if the date is today, false otherwise
   */
  isToday(date: Date): boolean {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  },

  /**
   * Adds days to a date
   * @param date - The base date
   * @param days - Number of days to add
   * @returns New date with days added
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Formats a date to YYYY-MM-DD
   * @param date - The date to format
   * @returns Formatted date string
   */
  formatToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Gets the day name from a date
   * @param date - The date
   * @returns Day name (e.g., 'Monday')
   */
  getDayName(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
  },

  /**
   * Checks if two dates are the same day
   * @param date1 - First date
   * @param date2 - Second date
   * @returns true if both dates are on the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  },
} as const;
