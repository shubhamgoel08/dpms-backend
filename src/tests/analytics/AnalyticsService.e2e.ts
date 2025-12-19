import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AnalyticsService } from '../../modules/analytics/application/services/AnalyticsService';
import { AppointmentService } from '../../modules/appointment/application/services/AppointmentService';
import { AppointmentRepository, appointmentRepositoryProvider } from '../../modules/appointment/domain/repositories/AppointmentRepository';
import { DoctorRepository, doctorRepositoryProvider } from '../../modules/doctor/domain/repositories/DoctorRepository';
import { TimeSlotRepository, timeSlotRepositoryProvider } from '../../modules/timeSlot/domain/repositories/TimeSlotRepository';
import { TestAppHelper } from '../helpers/TestAppHelper';
import { TestDataFactory } from '../helpers/TestDataFactory';
import { SpecialityEnum } from '../../modules/doctor/domain/enums/SpecialityEnum';

describe('AnalyticsService E2E Tests', () => {
  let app: INestApplication;
  let analyticsService: AnalyticsService;
  let appointmentRepository: AppointmentRepository;
  let doctorRepository: DoctorRepository;
  let timeSlotRepository: TimeSlotRepository;
  let dataSource: DataSource;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const testSetup = await TestAppHelper.createTestApp([
      AnalyticsService,
      AppointmentService,
      AppointmentRepository,
      appointmentRepositoryProvider,
      DoctorRepository,
      doctorRepositoryProvider,
      TimeSlotRepository,
      timeSlotRepositoryProvider,
    ]);

    app = testSetup.app;
    dataSource = testSetup.dataSource;
    cleanup = testSetup.cleanup;

    analyticsService = app.get<AnalyticsService>(AnalyticsService);
    appointmentRepository = app.get<AppointmentRepository>(AppointmentRepository);
    doctorRepository = app.get<DoctorRepository>(DoctorRepository);
    timeSlotRepository = app.get<TimeSlotRepository>(TimeSlotRepository);
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await TestAppHelper.closeTestApp(app, dataSource);
  });

  describe('complete analytics workflow', () => {
    beforeEach(async () => {
      // Create comprehensive test data
      // Doctor 1: Cardiologist with 10 appointments
      const doctor1 = await TestDataFactory.createDoctor(1, {
        email: 'cardiologist@test.com',
        name: 'Dr. Cardio Popular',
        speciality: SpecialityEnum.CARDIOLOGY,
        experienceYears: 15,
      });
      const savedDoctor1 = await doctorRepository.save(doctor1);

      // Doctor 2: Neurologist with 7 appointments
      const doctor2 = await TestDataFactory.createDoctor(1, {
        email: 'neurologist@test.com',
        name: 'Dr. Neuro Medium',
        speciality: SpecialityEnum.NEUROLOGY,
        experienceYears: 10,
      });
      const savedDoctor2 = await doctorRepository.save(doctor2);

      // Doctor 3: Pediatrician with 3 appointments
      const doctor3 = await TestDataFactory.createDoctor(1, {
        email: 'pediatrician@test.com',
        name: 'Dr. Pedia Less',
        speciality: SpecialityEnum.PEDIATRICS,
        experienceYears: 5,
      });
      const savedDoctor3 = await doctorRepository.save(doctor3);

      // Create time slots for each doctor
      // Morning slot (09:00-10:00) - most popular
      const morningSlot1 = TestDataFactory.createTimeSlot(savedDoctor1.id, {
        startTime: '09:00:00',
        endTime: '10:00:00',
      });
      const morningSlot2 = TestDataFactory.createTimeSlot(savedDoctor2.id, {
        startTime: '09:00:00',
        endTime: '10:00:00',
      });

      // Afternoon slot (14:00-15:00) - medium popularity
      const afternoonSlot1 = TestDataFactory.createTimeSlot(savedDoctor1.id, {
        startTime: '14:00:00',
        endTime: '15:00:00',
      });
      const afternoonSlot2 = TestDataFactory.createTimeSlot(savedDoctor2.id, {
        startTime: '14:00:00',
        endTime: '15:00:00',
      });

      // Evening slot (17:00-18:00) - least popular
      const eveningSlot = TestDataFactory.createTimeSlot(savedDoctor3.id, {
        startTime: '17:00:00',
        endTime: '18:00:00',
      });

      const savedMorningSlot1 = await timeSlotRepository.save(morningSlot1);
      const savedMorningSlot2 = await timeSlotRepository.save(morningSlot2);
      const savedAfternoonSlot1 = await timeSlotRepository.save(afternoonSlot1);
      const savedAfternoonSlot2 = await timeSlotRepository.save(afternoonSlot2);
      const savedEveningSlot = await timeSlotRepository.save(eveningSlot);

      // Create appointments for Doctor 1 (Cardiologist) - 10 total
      // 6 in morning slot
      for (let i = 0; i < 6; i++) {
        const appointment = TestDataFactory.createAppointment(
          1000 + i,
          savedDoctor1.id,
          savedMorningSlot1.id,
        );
        await appointmentRepository.save(appointment);
      }
      // 4 in afternoon slot
      for (let i = 0; i < 4; i++) {
        const appointment = TestDataFactory.createAppointment(
          1100 + i,
          savedDoctor1.id,
          savedAfternoonSlot1.id,
        );
        await appointmentRepository.save(appointment);
      }

      // Create appointments for Doctor 2 (Neurologist) - 7 total
      // 4 in morning slot
      for (let i = 0; i < 4; i++) {
        const appointment = TestDataFactory.createAppointment(
          2000 + i,
          savedDoctor2.id,
          savedMorningSlot2.id,
        );
        await appointmentRepository.save(appointment);
      }
      // 3 in afternoon slot
      for (let i = 0; i < 3; i++) {
        const appointment = TestDataFactory.createAppointment(
          2100 + i,
          savedDoctor2.id,
          savedAfternoonSlot2.id,
        );
        await appointmentRepository.save(appointment);
      }

      // Create appointments for Doctor 3 (Pediatrician) - 3 total
      // All in evening slot
      for (let i = 0; i < 3; i++) {
        const appointment = TestDataFactory.createAppointment(
          3000 + i,
          savedDoctor3.id,
          savedEveningSlot.id,
        );
        await appointmentRepository.save(appointment);
      }
    });

    describe('getMostBookedDoctors', () => {
      it('should return doctors ordered by booking count (descending)', async () => {
        // Act
        const result = await analyticsService.getMostBookedDoctors(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThanOrEqual(3);

        // Verify order (most booked first)
        expect(result[0].doctorName).toBe('Dr. Cardio Popular');
        expect(result[0].bookingCount).toBe(10);

        expect(result[1].doctorName).toBe('Dr. Neuro Medium');
        expect(result[1].bookingCount).toBe(7);

        expect(result[2].doctorName).toBe('Dr. Pedia Less');
        expect(result[2].bookingCount).toBe(3);
      });

      it('should respect limit parameter', async () => {
        // Act
        const result = await analyticsService.getMostBookedDoctors(2);

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].doctorName).toBe('Dr. Cardio Popular');
        expect(result[1].doctorName).toBe('Dr. Neuro Medium');
      });
    });

    describe('getMostBookedSpecialities', () => {
      it('should return specialities ordered by booking count (descending)', async () => {
        // Act
        const result = await analyticsService.getMostBookedSpecialities(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThanOrEqual(3);

        // Verify order
        expect(result[0].speciality).toBe(SpecialityEnum.CARDIOLOGY);
        expect(result[0].bookingCount).toBe(10);

        expect(result[1].speciality).toBe(SpecialityEnum.NEUROLOGY);
        expect(result[1].bookingCount).toBe(7);

        expect(result[2].speciality).toBe(SpecialityEnum.PEDIATRICS);
        expect(result[2].bookingCount).toBe(3);
      });

      it('should respect limit parameter', async () => {
        // Act
        const result = await analyticsService.getMostBookedSpecialities(1);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].speciality).toBe(SpecialityEnum.CARDIOLOGY);
      });
    });

    describe('getMostBookedTimeSlots', () => {
      it('should return time slots ordered by booking count (descending)', async () => {
        // Act
        const result = await analyticsService.getMostBookedTimeSlots(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThanOrEqual(3);

        // Morning slot should be most popular (6 + 4 = 10 bookings)
        expect(result[0].startTime).toBe('09:00:00');
        expect(result[0].endTime).toBe('10:00:00');
        expect(result[0].bookingCount).toBe(10);

        // Afternoon slot should be second (4 + 3 = 7 bookings)
        expect(result[1].startTime).toBe('14:00:00');
        expect(result[1].endTime).toBe('15:00:00');
        expect(result[1].bookingCount).toBe(7);

        // Evening slot should be third (3 bookings)
        expect(result[2].startTime).toBe('17:00:00');
        expect(result[2].endTime).toBe('18:00:00');
        expect(result[2].bookingCount).toBe(3);
      });

      it('should respect limit parameter', async () => {
        // Act
        const result = await analyticsService.getMostBookedTimeSlots(2);

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].startTime).toBe('09:00:00');
        expect(result[1].startTime).toBe('14:00:00');
      });
    });

    describe('getAnalytics', () => {
      it('should return comprehensive analytics data', async () => {
        // Act
        const result = await analyticsService.getAnalytics(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.mostBookedDoctors).toBeDefined();
        expect(result.mostBookedSpecialities).toBeDefined();
        expect(result.mostBookedTimeSlots).toBeDefined();

        // Verify structure
        expect(result.mostBookedDoctors.length).toBeGreaterThan(0);
        expect(result.mostBookedDoctors[0]).toHaveProperty('doctorId');
        expect(result.mostBookedDoctors[0]).toHaveProperty('doctorName');
        expect(result.mostBookedDoctors[0]).toHaveProperty('bookingCount');

        expect(result.mostBookedSpecialities.length).toBeGreaterThan(0);
        expect(result.mostBookedSpecialities[0]).toHaveProperty('speciality');
        expect(result.mostBookedSpecialities[0]).toHaveProperty('bookingCount');

        expect(result.mostBookedTimeSlots.length).toBeGreaterThan(0);
        expect(result.mostBookedTimeSlots[0]).toHaveProperty('startTime');
        expect(result.mostBookedTimeSlots[0]).toHaveProperty('endTime');
        expect(result.mostBookedTimeSlots[0]).toHaveProperty('bookingCount');

        // Verify data integrity
        expect(result.mostBookedDoctors[0].doctorName).toBe(
          'Dr. Cardio Popular',
        );
        expect(result.mostBookedSpecialities[0].speciality).toBe(
          SpecialityEnum.CARDIOLOGY,
        );
        expect(result.mostBookedTimeSlots[0].startTime).toBe('09:00:00');
      });

      it('should return limited results based on limit parameter', async () => {
        // Act
        const result = await analyticsService.getAnalytics(2);

        // Assert
        expect(result.mostBookedDoctors).toHaveLength(2);
        expect(result.mostBookedSpecialities).toHaveLength(2);
        expect(result.mostBookedTimeSlots).toHaveLength(2);
      });
    });
  });

  describe('edge cases', () => {
    it('should return empty analytics when no appointments exist', async () => {
      // Act
      const result = await analyticsService.getAnalytics(10);

      // Assert
      expect(result.mostBookedDoctors).toEqual([]);
      expect(result.mostBookedSpecialities).toEqual([]);
      expect(result.mostBookedTimeSlots).toEqual([]);
    });

    it('should handle single appointment correctly', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'single@test.com',
        speciality: SpecialityEnum.GENERAL_MEDICINE,
      });
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor.id);
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      const appointment = TestDataFactory.createAppointment(
        9999,
        savedDoctor.id,
        savedTimeSlot.id,
      );
      await appointmentRepository.save(appointment);

      // Act
      const result = await analyticsService.getAnalytics(10);

      // Assert
      expect(result.mostBookedDoctors).toHaveLength(1);
      expect(result.mostBookedDoctors[0].bookingCount).toBe(1);

      expect(result.mostBookedSpecialities).toHaveLength(1);
      expect(result.mostBookedSpecialities[0].speciality).toBe(
        SpecialityEnum.GENERAL_MEDICINE,
      );
      expect(result.mostBookedSpecialities[0].bookingCount).toBe(1);

      expect(result.mostBookedTimeSlots).toHaveLength(1);
      expect(result.mostBookedTimeSlots[0].bookingCount).toBe(1);
    });
  });
});
