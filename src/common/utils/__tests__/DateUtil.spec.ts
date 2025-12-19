import { DateUtil } from '../DateUtil';

describe('DateUtil', () => {
  describe('isPast', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(DateUtil.isPast(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();

      expect(DateUtil.isPast(today)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(DateUtil.isPast(tomorrow)).toBe(false);
    });

    it('should return true for date one week ago', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      expect(DateUtil.isPast(weekAgo)).toBe(true);
    });
  });

  describe('isFuture', () => {
    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(DateUtil.isFuture(yesterday)).toBe(false);
    });

    it('should return false for today', () => {
      const today = new Date();

      expect(DateUtil.isFuture(today)).toBe(false);
    });

    it('should return true for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(DateUtil.isFuture(tomorrow)).toBe(true);
    });

    it('should return true for date one month ahead', () => {
      const monthAhead = new Date();
      monthAhead.setMonth(monthAhead.getMonth() + 1);

      expect(DateUtil.isFuture(monthAhead)).toBe(true);
    });
  });

  describe('isToday', () => {
    it('should return true for current date', () => {
      const now = new Date();

      expect(DateUtil.isToday(now)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(DateUtil.isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(DateUtil.isToday(tomorrow)).toBe(false);
    });

    it('should return true regardless of time on the same day', () => {
      const morning = new Date();
      morning.setHours(6, 0, 0, 0);

      const evening = new Date();
      evening.setHours(18, 30, 0, 0);

      expect(DateUtil.isToday(morning)).toBe(true);
      expect(DateUtil.isToday(evening)).toBe(true);
    });
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const date = new Date('2024-01-15');
      const result = DateUtil.addDays(date, 5);

      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle negative days (subtract)', () => {
      const date = new Date('2024-01-15');
      const result = DateUtil.addDays(date, -5);

      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-30');
      const result = DateUtil.addDays(date, 5);

      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(1); // February
    });

    it('should handle year boundaries', () => {
      const date = new Date('2024-12-30');
      const result = DateUtil.addDays(date, 5);

      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getFullYear()).toBe(2025);
    });

    it('should not mutate the original date', () => {
      const date = new Date('2024-01-15');
      const originalDate = date.getDate();

      DateUtil.addDays(date, 5);

      expect(date.getDate()).toBe(originalDate);
    });
  });

  describe('formatToYYYYMMDD', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15');
      const result = DateUtil.formatToYYYYMMDD(date);

      expect(result).toBe('2024-03-15');
    });

    it('should pad single digit month and day with zero', () => {
      const date = new Date('2024-01-05');
      const result = DateUtil.formatToYYYYMMDD(date);

      expect(result).toBe('2024-01-05');
    });

    it('should handle December correctly', () => {
      const date = new Date('2024-12-25');
      const result = DateUtil.formatToYYYYMMDD(date);

      expect(result).toBe('2024-12-25');
    });

    it('should handle the last day of the year', () => {
      const date = new Date('2024-12-31');
      const result = DateUtil.formatToYYYYMMDD(date);

      expect(result).toBe('2024-12-31');
    });
  });

  describe('getDayName', () => {
    it('should return correct day name for Sunday', () => {
      const date = new Date('2024-01-07'); // Sunday
      expect(DateUtil.getDayName(date)).toBe('Sunday');
    });

    it('should return correct day name for Monday', () => {
      const date = new Date('2024-01-08'); // Monday
      expect(DateUtil.getDayName(date)).toBe('Monday');
    });

    it('should return correct day name for Friday', () => {
      const date = new Date('2024-01-12'); // Friday
      expect(DateUtil.getDayName(date)).toBe('Friday');
    });

    it('should return correct day name for Saturday', () => {
      const date = new Date('2024-01-13'); // Saturday
      expect(DateUtil.getDayName(date)).toBe('Saturday');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day at different times', () => {
      const morning = new Date('2024-01-15 08:00:00');
      const evening = new Date('2024-01-15 18:00:00');

      expect(DateUtil.isSameDay(morning, evening)).toBe(true);
    });

    it('should return false for different days', () => {
      const today = new Date('2024-01-15');
      const tomorrow = new Date('2024-01-16');

      expect(DateUtil.isSameDay(today, tomorrow)).toBe(false);
    });

    it('should return false for same date in different months', () => {
      const january = new Date('2024-01-15');
      const february = new Date('2024-02-15');

      expect(DateUtil.isSameDay(january, february)).toBe(false);
    });

    it('should return false for same month-day in different years', () => {
      const year2024 = new Date('2024-01-15');
      const year2025 = new Date('2025-01-15');

      expect(DateUtil.isSameDay(year2024, year2025)).toBe(false);
    });

    it('should return true for exact same date and time', () => {
      const date1 = new Date('2024-01-15 12:30:45');
      const date2 = new Date('2024-01-15 12:30:45');

      expect(DateUtil.isSameDay(date1, date2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle leap year correctly', () => {
      const leapDay = new Date('2024-02-29');
      expect(DateUtil.formatToYYYYMMDD(leapDay)).toBe('2024-02-29');

      const dayAfter = DateUtil.addDays(leapDay, 1);
      expect(DateUtil.formatToYYYYMMDD(dayAfter)).toBe('2024-03-01');
    });

    it('should handle century year correctly', () => {
      const date = new Date('2000-01-01');
      expect(DateUtil.formatToYYYYMMDD(date)).toBe('2000-01-01');
    });

    it('should handle date objects created from timestamps', () => {
      const timestamp = 1705276800000; // Jan 15, 2024
      const date = new Date(timestamp);

      expect(DateUtil.isToday(date)).toBe(false);
      expect(DateUtil.formatToYYYYMMDD(date)).toBe('2024-01-15');
    });
  });
});
