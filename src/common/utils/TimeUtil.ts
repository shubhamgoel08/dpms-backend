export const TimeUtil = {
  /**
   * Converts time string (HH:MM:SS) to minutes
   * @param timeString - Time in format "HH:MM:SS"
   * @returns Total minutes
   */
  timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  },

  /**
   * Checks if end time is after start time
   * @param startTime - Start time in format "HH:MM:SS"
   * @param endTime - End time in format "HH:MM:SS"
   * @returns true if end time is after start time
   */
  isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
    return this.timeToMinutes(endTime) > this.timeToMinutes(startTime);
  },

  /**
   * Calculates duration between two times in minutes
   * @param startTime - Start time in format "HH:MM:SS"
   * @param endTime - End time in format "HH:MM:SS"
   * @returns Duration in minutes
   */
  calculateDurationInMinutes(startTime: string, endTime: string): number {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    return endMinutes - startMinutes;
  },

  /**
   * Validates time string format
   * @param timeString - Time string to validate
   * @returns true if valid format (HH:MM:SS or HH:MM)
   */
  isValidTimeFormat(timeString: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(timeString);
  },

  /**
   * Converts 12-hour time to 24-hour format
   * @param time - Time in 12-hour format (e.g., "02:30 PM")
   * @returns Time in 24-hour format (e.g., "14:30:00")
   */
  convertTo24Hour(time: string): string {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  },

  /**
   * Converts 24-hour time to 12-hour format
   * @param time - Time in 24-hour format (e.g., "14:30:00")
   * @returns Time in 12-hour format (e.g., "02:30 PM")
   */
  convertTo12Hour(time: string): string {
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;

    const period = hours >= 12 ? 'PM' : 'AM';

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  },

  /**
   * Checks if a time falls within a range
   * @param time - Time to check (HH:MM:SS)
   * @param startTime - Range start time (HH:MM:SS)
   * @param endTime - Range end time (HH:MM:SS)
   * @returns true if time is within range
   */
  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  },

  /**
   * Adds minutes to a time
   * @param time - Base time (HH:MM:SS)
   * @param minutesToAdd - Minutes to add
   * @returns New time (HH:MM:SS)
   */
  addMinutes(time: string, minutesToAdd: number): string {
    const totalMinutes = this.timeToMinutes(time) + minutesToAdd;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  },
} as const;
