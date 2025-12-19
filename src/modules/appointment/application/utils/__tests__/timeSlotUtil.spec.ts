import {timeSlotUtil} from '../timeSlotUtil'

/**
 * Unit Tests for timeSlotUtil
 *
 * These test pure, algorithmic functions that:
 * - Are generic and independent of application logic
 * - Have no side effects
 * - Are perfect candidates for unit testing
 */
describe('timeSlotUtil', () => {
  describe('timeToMinutes', () => {
    it('should convert midnight to 0 minutes', () => {
      expect(timeSlotUtil.timeToMinutes('00:00')).toBe(0)
    })

    it('should convert 01:00 to 60 minutes', () => {
      expect(timeSlotUtil.timeToMinutes('01:00')).toBe(60)
    })

    it('should convert 12:30 to 750 minutes', () => {
      expect(timeSlotUtil.timeToMinutes('12:30')).toBe(750)
    })

    it('should convert 23:59 to 1439 minutes', () => {
      expect(timeSlotUtil.timeToMinutes('23:59')).toBe(1439)
    })

    it('should handle times with leading zeros', () => {
      expect(timeSlotUtil.timeToMinutes('09:05')).toBe(545)
    })
  })

  describe('minutesToTime', () => {
    it('should convert 0 minutes to 00:00', () => {
      expect(timeSlotUtil.minutesToTime(0)).toBe('00:00')
    })

    it('should convert 60 minutes to 01:00', () => {
      expect(timeSlotUtil.minutesToTime(60)).toBe('01:00')
    })

    it('should convert 750 minutes to 12:30', () => {
      expect(timeSlotUtil.minutesToTime(750)).toBe('12:30')
    })

    it('should convert 1439 minutes to 23:59', () => {
      expect(timeSlotUtil.minutesToTime(1439)).toBe('23:59')
    })

    it('should pad single digit hours and minutes', () => {
      expect(timeSlotUtil.minutesToTime(65)).toBe('01:05')
    })
  })

  describe('doTimesOverlap', () => {
    it('should return true for overlapping ranges', () => {
      expect(timeSlotUtil.doTimesOverlap('09:00', '10:00', '09:30', '10:30')).toBe(true)
    })

    it('should return true for contained range', () => {
      expect(timeSlotUtil.doTimesOverlap('09:00', '12:00', '10:00', '11:00')).toBe(true)
    })

    it('should return false for non-overlapping ranges', () => {
      expect(timeSlotUtil.doTimesOverlap('09:00', '10:00', '10:30', '11:30')).toBe(false)
    })

    it('should return false for adjacent ranges (touching but not overlapping)', () => {
      expect(timeSlotUtil.doTimesOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false)
    })

    it('should return true when one range completely contains another', () => {
      expect(timeSlotUtil.doTimesOverlap('08:00', '12:00', '09:00', '11:00')).toBe(true)
    })
  })

  describe('generateTimeSlots', () => {
    it('should generate slots with specified duration', () => {
      const slots = timeSlotUtil.generateTimeSlots('09:00', '10:00', 30)

      expect(slots).toHaveLength(2)
      expect(slots[0]).toEqual({startTime: '09:00', endTime: '09:30'})
      expect(slots[1]).toEqual({startTime: '09:30', endTime: '10:00'})
    })

    it('should generate slots for longer range', () => {
      const slots = timeSlotUtil.generateTimeSlots('09:00', '12:00', 30)

      expect(slots).toHaveLength(6)
      expect(slots[0].startTime).toBe('09:00')
      expect(slots[5].endTime).toBe('12:00')
    })

    it('should return empty array if duration exceeds range', () => {
      const slots = timeSlotUtil.generateTimeSlots('09:00', '09:15', 30)

      expect(slots).toHaveLength(0)
    })

    it('should handle 15-minute slots', () => {
      const slots = timeSlotUtil.generateTimeSlots('14:00', '15:00', 15)

      expect(slots).toHaveLength(4)
      expect(slots[0]).toEqual({startTime: '14:00', endTime: '14:15'})
      expect(slots[3]).toEqual({startTime: '14:45', endTime: '15:00'})
    })

    it('should handle 1-hour slots', () => {
      const slots = timeSlotUtil.generateTimeSlots('09:00', '12:00', 60)

      expect(slots).toHaveLength(3)
      expect(slots[0]).toEqual({startTime: '09:00', endTime: '10:00'})
      expect(slots[2]).toEqual({startTime: '11:00', endTime: '12:00'})
    })
  })

  describe('isValidTimeFormat', () => {
    it('should return true for valid HH:MM format', () => {
      expect(timeSlotUtil.isValidTimeFormat('09:30')).toBe(true)
      expect(timeSlotUtil.isValidTimeFormat('23:59')).toBe(true)
      expect(timeSlotUtil.isValidTimeFormat('00:00')).toBe(true)
    })

    it('should return true for single digit hour', () => {
      expect(timeSlotUtil.isValidTimeFormat('9:30')).toBe(true)
    })

    it('should return false for invalid formats', () => {
      expect(timeSlotUtil.isValidTimeFormat('25:00')).toBe(false)
      expect(timeSlotUtil.isValidTimeFormat('12:60')).toBe(false)
      expect(timeSlotUtil.isValidTimeFormat('12:5')).toBe(false)
      expect(timeSlotUtil.isValidTimeFormat('abc')).toBe(false)
      expect(timeSlotUtil.isValidTimeFormat('')).toBe(false)
    })

    it('should return false for times with seconds', () => {
      expect(timeSlotUtil.isValidTimeFormat('12:30:00')).toBe(false)
    })
  })

  describe('calculateDuration', () => {
    it('should calculate duration between two times', () => {
      expect(timeSlotUtil.calculateDuration('09:00', '10:00')).toBe(60)
    })

    it('should calculate duration for half hour', () => {
      expect(timeSlotUtil.calculateDuration('09:00', '09:30')).toBe(30)
    })

    it('should calculate duration for multiple hours', () => {
      expect(timeSlotUtil.calculateDuration('09:00', '17:00')).toBe(480)
    })

    it('should handle minutes in calculation', () => {
      expect(timeSlotUtil.calculateDuration('09:15', '10:45')).toBe(90)
    })

    it('should return 0 for same times', () => {
      expect(timeSlotUtil.calculateDuration('12:00', '12:00')).toBe(0)
    })
  })

  describe('isTimeInRange', () => {
    it('should return true for time at range start', () => {
      expect(timeSlotUtil.isTimeInRange('09:00', '09:00', '10:00')).toBe(true)
    })

    it('should return true for time in middle of range', () => {
      expect(timeSlotUtil.isTimeInRange('09:30', '09:00', '10:00')).toBe(true)
    })

    it('should return false for time at range end (exclusive)', () => {
      expect(timeSlotUtil.isTimeInRange('10:00', '09:00', '10:00')).toBe(false)
    })

    it('should return false for time before range', () => {
      expect(timeSlotUtil.isTimeInRange('08:00', '09:00', '10:00')).toBe(false)
    })

    it('should return false for time after range', () => {
      expect(timeSlotUtil.isTimeInRange('11:00', '09:00', '10:00')).toBe(false)
    })
  })
})

