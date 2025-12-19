/**
 * Utility functions for time slot calculations.
 *
 * These are pure, algorithmic functions that:
 * - Are generic and reusable
 * - Have no side effects
 * - Are not tightly coupled to the rest of the application
 *
 * Perfect candidates for unit testing.
 */

/**
 * Converts a time string (HH:MM) to minutes since midnight.
 * @param time - Time string in HH:MM format
 * @returns Minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Converts minutes since midnight to time string (HH:MM).
 * @param minutes - Minutes since midnight
 * @returns Time string in HH:MM format
 */
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Checks if two time ranges overlap.
 * @param start1 - Start time of first range
 * @param end1 - End time of first range
 * @param start2 - Start time of second range
 * @param end2 - End time of second range
 * @returns true if ranges overlap
 */
const doTimesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)

  return s1 < e2 && e1 > s2
}

/**
 * Generates time slots within a range.
 * @param startTime - Start time of the range (HH:MM)
 * @param endTime - End time of the range (HH:MM)
 * @param durationMinutes - Duration of each slot in minutes
 * @returns Array of time slots
 */
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  durationMinutes: number,
): {startTime: string; endTime: string}[] => {
  const slots: {startTime: string; endTime: string}[] = []
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  for (let time = startMinutes; time + durationMinutes <= endMinutes; time += durationMinutes) {
    slots.push({
      startTime: minutesToTime(time),
      endTime: minutesToTime(time + durationMinutes),
    })
  }

  return slots
}

/**
 * Validates if a time string is in valid HH:MM format.
 * @param time - Time string to validate
 * @returns true if valid
 */
const isValidTimeFormat = (time: string): boolean => {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(time)
}

/**
 * Calculates the duration between two times in minutes.
 * @param startTime - Start time (HH:MM)
 * @param endTime - End time (HH:MM)
 * @returns Duration in minutes
 */
const calculateDuration = (startTime: string, endTime: string): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime)
}

/**
 * Checks if a time is within a range (inclusive start, exclusive end).
 * @param time - Time to check
 * @param rangeStart - Range start time
 * @param rangeEnd - Range end time
 * @returns true if time is within range
 */
const isTimeInRange = (time: string, rangeStart: string, rangeEnd: string): boolean => {
  const t = timeToMinutes(time)
  const start = timeToMinutes(rangeStart)
  const end = timeToMinutes(rangeEnd)

  return t >= start && t < end
}

export const timeSlotUtil = {
  timeToMinutes,
  minutesToTime,
  doTimesOverlap,
  generateTimeSlots,
  isValidTimeFormat,
  calculateDuration,
  isTimeInRange,
} as const
