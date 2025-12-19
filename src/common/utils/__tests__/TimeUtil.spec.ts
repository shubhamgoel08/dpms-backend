import { TimeUtil } from '../TimeUtil';

describe('TimeUtil', () => {
  describe('timeToMinutes', () => {
    it('should convert midnight to 0 minutes', () => {
      expect(TimeUtil.timeToMinutes('00:00:00')).toBe(0);
    });

    it('should convert 1 hour to 60 minutes', () => {
      expect(TimeUtil.timeToMinutes('01:00:00')).toBe(60);
    });

    it('should convert time with minutes correctly', () => {
      expect(TimeUtil.timeToMinutes('02:30:00')).toBe(150);
    });

    it('should convert noon to 720 minutes', () => {
      expect(TimeUtil.timeToMinutes('12:00:00')).toBe(720);
    });

    it('should convert 23:59 to 1439 minutes', () => {
      expect(TimeUtil.timeToMinutes('23:59:00')).toBe(1439);
    });
  });

  describe('isEndTimeAfterStartTime', () => {
    it('should return true when end time is after start time', () => {
      expect(
        TimeUtil.isEndTimeAfterStartTime('09:00:00', '10:00:00'),
      ).toBe(true);
    });

    it('should return false when end time equals start time', () => {
      expect(
        TimeUtil.isEndTimeAfterStartTime('09:00:00', '09:00:00'),
      ).toBe(false);
    });

    it('should return false when end time is before start time', () => {
      expect(
        TimeUtil.isEndTimeAfterStartTime('10:00:00', '09:00:00'),
      ).toBe(false);
    });

    it('should handle times across different hours', () => {
      expect(
        TimeUtil.isEndTimeAfterStartTime('08:45:00', '11:15:00'),
      ).toBe(true);
    });
  });

  describe('calculateDurationInMinutes', () => {
    it('should calculate 1-hour duration correctly', () => {
      expect(
        TimeUtil.calculateDurationInMinutes('09:00:00', '10:00:00'),
      ).toBe(60);
    });

    it('should calculate 30-minute duration correctly', () => {
      expect(
        TimeUtil.calculateDurationInMinutes('09:00:00', '09:30:00'),
      ).toBe(30);
    });

    it('should calculate 2.5-hour duration correctly', () => {
      expect(
        TimeUtil.calculateDurationInMinutes('09:00:00', '11:30:00'),
      ).toBe(150);
    });

    it('should return negative duration when end is before start', () => {
      expect(
        TimeUtil.calculateDurationInMinutes('10:00:00', '09:00:00'),
      ).toBe(-60);
    });

    it('should return 0 for same times', () => {
      expect(
        TimeUtil.calculateDurationInMinutes('09:00:00', '09:00:00'),
      ).toBe(0);
    });
  });

  describe('isValidTimeFormat', () => {
    it('should validate correct HH:MM:SS format', () => {
      expect(TimeUtil.isValidTimeFormat('09:30:45')).toBe(true);
    });

    it('should validate correct HH:MM format', () => {
      expect(TimeUtil.isValidTimeFormat('09:30')).toBe(true);
    });

    it('should validate midnight', () => {
      expect(TimeUtil.isValidTimeFormat('00:00:00')).toBe(true);
    });

    it('should validate 23:59:59', () => {
      expect(TimeUtil.isValidTimeFormat('23:59:59')).toBe(true);
    });

    it('should reject invalid hour (24)', () => {
      expect(TimeUtil.isValidTimeFormat('24:00:00')).toBe(false);
    });

    it('should reject invalid minute (60)', () => {
      expect(TimeUtil.isValidTimeFormat('12:60:00')).toBe(false);
    });

    it('should reject invalid second (60)', () => {
      expect(TimeUtil.isValidTimeFormat('12:30:60')).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(TimeUtil.isValidTimeFormat('9:30')).toBe(false);
      expect(TimeUtil.isValidTimeFormat('abc:def')).toBe(false);
      expect(TimeUtil.isValidTimeFormat('12-30-45')).toBe(false);
    });
  });

  describe('convertTo24Hour', () => {
    it('should convert 12:00 AM to 00:00:00', () => {
      expect(TimeUtil.convertTo24Hour('12:00 AM')).toBe('00:00:00');
    });

    it('should convert 1:00 AM to 01:00:00', () => {
      expect(TimeUtil.convertTo24Hour('01:00 AM')).toBe('01:00:00');
    });

    it('should convert 12:00 PM to 12:00:00', () => {
      expect(TimeUtil.convertTo24Hour('12:00 PM')).toBe('12:00:00');
    });

    it('should convert 1:00 PM to 13:00:00', () => {
      expect(TimeUtil.convertTo24Hour('01:00 PM')).toBe('13:00:00');
    });

    it('should convert 11:59 PM to 23:59:00', () => {
      expect(TimeUtil.convertTo24Hour('11:59 PM')).toBe('23:59:00');
    });

    it('should convert 6:30 AM to 06:30:00', () => {
      expect(TimeUtil.convertTo24Hour('06:30 AM')).toBe('06:30:00');
    });

    it('should convert 6:30 PM to 18:30:00', () => {
      expect(TimeUtil.convertTo24Hour('06:30 PM')).toBe('18:30:00');
    });
  });

  describe('convertTo12Hour', () => {
    it('should convert 00:00:00 to 12:00 AM', () => {
      expect(TimeUtil.convertTo12Hour('00:00:00')).toBe('12:00 AM');
    });

    it('should convert 01:00:00 to 01:00 AM', () => {
      expect(TimeUtil.convertTo12Hour('01:00:00')).toBe('01:00 AM');
    });

    it('should convert 12:00:00 to 12:00 PM', () => {
      expect(TimeUtil.convertTo12Hour('12:00:00')).toBe('12:00 PM');
    });

    it('should convert 13:00:00 to 01:00 PM', () => {
      expect(TimeUtil.convertTo12Hour('13:00:00')).toBe('01:00 PM');
    });

    it('should convert 23:59:00 to 11:59 PM', () => {
      expect(TimeUtil.convertTo12Hour('23:59:00')).toBe('11:59 PM');
    });

    it('should convert 06:30:00 to 06:30 AM', () => {
      expect(TimeUtil.convertTo12Hour('06:30:00')).toBe('06:30 AM');
    });

    it('should convert 18:30:00 to 06:30 PM', () => {
      expect(TimeUtil.convertTo12Hour('18:30:00')).toBe('06:30 PM');
    });
  });

  describe('isTimeInRange', () => {
    it('should return true when time is within range', () => {
      expect(
        TimeUtil.isTimeInRange('10:00:00', '09:00:00', '11:00:00'),
      ).toBe(true);
    });

    it('should return true when time equals start time', () => {
      expect(
        TimeUtil.isTimeInRange('09:00:00', '09:00:00', '11:00:00'),
      ).toBe(true);
    });

    it('should return true when time equals end time', () => {
      expect(
        TimeUtil.isTimeInRange('11:00:00', '09:00:00', '11:00:00'),
      ).toBe(true);
    });

    it('should return false when time is before range', () => {
      expect(
        TimeUtil.isTimeInRange('08:00:00', '09:00:00', '11:00:00'),
      ).toBe(false);
    });

    it('should return false when time is after range', () => {
      expect(
        TimeUtil.isTimeInRange('12:00:00', '09:00:00', '11:00:00'),
      ).toBe(false);
    });

    it('should handle times with minutes', () => {
      expect(
        TimeUtil.isTimeInRange('09:30:00', '09:00:00', '10:00:00'),
      ).toBe(true);
      expect(
        TimeUtil.isTimeInRange('10:01:00', '09:00:00', '10:00:00'),
      ).toBe(false);
    });
  });

  describe('addMinutes', () => {
    it('should add minutes within same hour', () => {
      expect(TimeUtil.addMinutes('09:00:00', 30)).toBe('09:30:00');
    });

    it('should add minutes crossing hour boundary', () => {
      expect(TimeUtil.addMinutes('09:45:00', 30)).toBe('10:15:00');
    });

    it('should add 60 minutes (1 hour)', () => {
      expect(TimeUtil.addMinutes('09:00:00', 60)).toBe('10:00:00');
    });

    it('should add multiple hours worth of minutes', () => {
      expect(TimeUtil.addMinutes('09:00:00', 150)).toBe('11:30:00');
    });

    it('should wrap around midnight when adding to late evening', () => {
      expect(TimeUtil.addMinutes('23:30:00', 60)).toBe('00:30:00');
    });

    it('should handle adding 0 minutes', () => {
      expect(TimeUtil.addMinutes('09:00:00', 0)).toBe('09:00:00');
    });

    it('should handle subtracting minutes (negative)', () => {
      expect(TimeUtil.addMinutes('10:30:00', -30)).toBe('10:00:00');
    });

    it('should handle large additions', () => {
      expect(TimeUtil.addMinutes('00:00:00', 1440)).toBe('00:00:00'); // +24 hours
    });
  });

  describe('time conversion round-trip', () => {
    it('should convert to 24-hour and back to 12-hour correctly', () => {
      const time12 = '02:30 PM';
      const time24 = TimeUtil.convertTo24Hour(time12);
      const backTo12 = TimeUtil.convertTo12Hour(time24);

      expect(backTo12).toBe(time12);
    });

    it('should handle midnight round-trip', () => {
      const midnight24 = '00:00:00';
      const midnight12 = TimeUtil.convertTo12Hour(midnight24);
      const backTo24 = TimeUtil.convertTo24Hour(midnight12);

      expect(backTo24).toBe(midnight24);
    });
  });

  describe('edge cases', () => {
    it('should handle single-digit hours in conversion', () => {
      expect(TimeUtil.convertTo24Hour('9:00 AM')).toBe('09:00:00');
    });

    it('should handle boundary times correctly', () => {
      expect(TimeUtil.timeToMinutes('00:00:00')).toBe(0);
      expect(TimeUtil.timeToMinutes('23:59:00')).toBe(1439);
    });

    it('should validate edge case times', () => {
      expect(TimeUtil.isValidTimeFormat('00:00:00')).toBe(true);
      expect(TimeUtil.isValidTimeFormat('23:59:59')).toBe(true);
    });
  });
});
