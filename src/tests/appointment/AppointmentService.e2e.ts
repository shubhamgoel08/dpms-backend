import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppointmentService } from '../../modules/appointment/application/services/AppointmentService';
import { AppointmentRepository, appointmentRepositoryProvider } from '../../modules/appointment/domain/repositories/AppointmentRepository';
import { DoctorRepository, doctorRepositoryProvider } from '../../modules/doctor/domain/repositories/DoctorRepository';
import { TimeSlotRepository, timeSlotRepositoryProvider } from '../../modules/timeSlot/domain/repositories/TimeSlotRepository';
import { TestAppHelper } from '../helpers/TestAppHelper';
import { TestDataFactory } from '../helpers/TestDataFactory';
import { AppointmentStatusEnum } from '../../modules/appointment/domain/enums/AppointmentStatusEnum';
import { SpecialityEnum } from '../../modules/doctor/domain/enums/SpecialityEnum';

describe('AppointmentService E2E Tests', () => {
  let app: INestApplication;
  let appointmentService: AppointmentService;
  let appointmentRepository: AppointmentRepository;
  let doctorRepository: DoctorRepository;
  let timeSlotRepository: TimeSlotRepository;
  let dataSource: DataSource;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const testSetup = await TestAppHelper.createTestApp([
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

    appointmentService = app.get<AppointmentService>(AppointmentService);
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

  describe('findById', () => {
    it('should find appointment by id', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor.id);
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      const appointment = TestDataFactory.createAppointment(
        1001,
        savedDoctor.id,
        savedTimeSlot.id,
      );
      const savedAppointment = await appointmentRepository.save(appointment);

      // Act
      const result = await appointmentService.findById(savedAppointment.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(savedAppointment.id);
      expect(result.patientId).toBe(1001);
      expect(result.doctorId).toBe(savedDoctor.id);
      expect(result.timeSlotId).toBe(savedTimeSlot.id);
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      // Act & Assert
      await expect(appointmentService.findById(99999)).rejects.toThrow(
        'Appointment not found',
      );
    });
  });

  describe('findByDoctorId', () => {
    it('should find all appointments for a doctor', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlots = TestDataFactory.generateMultipleTimeSlots(
        savedDoctor.id,
        3,
      );
      const savedTimeSlots = await Promise.all(
        timeSlots.map((ts) => timeSlotRepository.save(ts)),
      );

      // Create 3 appointments for this doctor
      for (let i = 0; i < 3; i++) {
        const appointment = TestDataFactory.createAppointment(
          1001 + i,
          savedDoctor.id,
          savedTimeSlots[i].id,
        );
        await appointmentRepository.save(appointment);
      }

      // Act
      const result = await appointmentService.findByDoctorId(savedDoctor.id);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every((apt) => apt.doctorId === savedDoctor.id)).toBe(
        true,
      );
    });

    it('should return empty array if doctor has no appointments', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      // Act
      const result = await appointmentService.findByDoctorId(savedDoctor.id);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByPatientId', () => {
    it('should find all appointments for a patient', async () => {
      // Arrange
      const doctor1 = await TestDataFactory.createDoctor(1);
      const doctor2 = await TestDataFactory.createDoctor(1);
      const savedDoctor1 = await doctorRepository.save(doctor1);
      const savedDoctor2 = await doctorRepository.save(doctor2);

      const timeSlot1 = TestDataFactory.createTimeSlot(savedDoctor1.id);
      const timeSlot2 = TestDataFactory.createTimeSlot(savedDoctor2.id);
      const savedTimeSlot1 = await timeSlotRepository.save(timeSlot1);
      const savedTimeSlot2 = await timeSlotRepository.save(timeSlot2);

      const patientId = 2001;

      // Create 2 appointments for same patient with different doctors
      const appointment1 = TestDataFactory.createAppointment(
        patientId,
        savedDoctor1.id,
        savedTimeSlot1.id,
      );
      const appointment2 = TestDataFactory.createAppointment(
        patientId,
        savedDoctor2.id,
        savedTimeSlot2.id,
      );

      await appointmentRepository.save(appointment1);
      await appointmentRepository.save(appointment2);

      // Act
      const result = await appointmentService.findByPatientId(patientId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((apt) => apt.patientId === patientId)).toBe(true);
    });

    it('should return empty array if patient has no appointments', async () => {
      // Act
      const result = await appointmentService.findByPatientId(9999);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save a new appointment', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor.id);
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      const appointment = TestDataFactory.createAppointment(
        3001,
        savedDoctor.id,
        savedTimeSlot.id,
      );

      // Act
      const result = await appointmentService.save(appointment);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.patientId).toBe(3001);
      expect(result.status).toBe(AppointmentStatusEnum.SCHEDULED);
    });

    it('should update existing appointment status', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor.id);
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      const appointment = TestDataFactory.createAppointment(
        3002,
        savedDoctor.id,
        savedTimeSlot.id,
      );
      const savedAppointment = await appointmentRepository.save(appointment);

      // Modify appointment
      savedAppointment.status = AppointmentStatusEnum.COMPLETED;

      // Act
      const result = await appointmentService.save(savedAppointment);

      // Assert
      expect(result.id).toBe(savedAppointment.id);
      expect(result.status).toBe(AppointmentStatusEnum.COMPLETED);
    });
  });

  describe('appointment analytics', () => {
    beforeEach(async () => {
      // Create test data for analytics
      const doctor1 = await TestDataFactory.createDoctor(1, {
        name: 'Dr. Popular',
        speciality: SpecialityEnum.CARDIOLOGY,
      });
      const doctor2 = await TestDataFactory.createDoctor(1, {
        name: 'Dr. Less Popular',
        speciality: SpecialityEnum.NEUROLOGY,
      });

      const savedDoctor1 = await doctorRepository.save(doctor1);
      const savedDoctor2 = await doctorRepository.save(doctor2);

      // Create time slots
      const timeSlot1 = TestDataFactory.createTimeSlot(savedDoctor1.id, {
        startTime: '09:00:00',
        endTime: '10:00:00',
      });
      const timeSlot2 = TestDataFactory.createTimeSlot(savedDoctor1.id, {
        startTime: '10:00:00',
        endTime: '11:00:00',
      });
      const timeSlot3 = TestDataFactory.createTimeSlot(savedDoctor2.id, {
        startTime: '09:00:00',
        endTime: '10:00:00',
      });

      const savedTimeSlot1 = await timeSlotRepository.save(timeSlot1);
      const savedTimeSlot2 = await timeSlotRepository.save(timeSlot2);
      const savedTimeSlot3 = await timeSlotRepository.save(timeSlot3);

      // Create 5 appointments for doctor1 (popular)
      for (let i = 0; i < 5; i++) {
        const appointment = TestDataFactory.createAppointment(
          4000 + i,
          savedDoctor1.id,
          i < 3 ? savedTimeSlot1.id : savedTimeSlot2.id,
        );
        await appointmentRepository.save(appointment);
      }

      // Create 2 appointments for doctor2
      for (let i = 0; i < 2; i++) {
        const appointment = TestDataFactory.createAppointment(
          5000 + i,
          savedDoctor2.id,
          savedTimeSlot3.id,
        );
        await appointmentRepository.save(appointment);
      }
    });

    describe('getMostBookedDoctors', () => {
      it('should return most booked doctors ordered by booking count', async () => {
        // Act
        const result = await appointmentService.getMostBookedDoctors(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].doctorName).toBe('Dr. Popular');
        expect(Number(result[0].bookingCount)).toBe(5);
      });
    });

    describe('getMostBookedSpecialities', () => {
      it('should return most booked specialities ordered by booking count', async () => {
        // Act
        const result = await appointmentService.getMostBookedSpecialities(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].speciality).toBe(SpecialityEnum.CARDIOLOGY);
        expect(Number(result[0].bookingCount)).toBe(5);
      });
    });

    describe('getMostBookedTimeSlots', () => {
      it('should return most booked time slots ordered by booking count', async () => {
        // Act
        const result = await appointmentService.getMostBookedTimeSlots(10);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        // 09:00-10:00 slot has 5 bookings (3 from doctor1 + 2 from doctor2)
        expect(result[0].startTime).toBe('09:00:00');
        expect(Number(result[0].bookingCount)).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
