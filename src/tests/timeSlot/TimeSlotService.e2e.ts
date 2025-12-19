import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TimeSlotService } from '../../modules/timeSlot/application/services/TimeSlotService';
import { TimeSlotRepository, timeSlotRepositoryProvider } from '../../modules/timeSlot/domain/repositories/TimeSlotRepository';
import { DoctorRepository, doctorRepositoryProvider } from '../../modules/doctor/domain/repositories/DoctorRepository';
import { TestAppHelper } from '../helpers/TestAppHelper';
import { TestDataFactory } from '../helpers/TestDataFactory';
import { CreateTimeSlotDto } from '../../modules/timeSlot/application/dtos/CreateTimeSlotDto';
import { CreateBulkTimeSlotsDto } from '../../modules/timeSlot/application/dtos/CreateBulkTimeSlotsDto';
import { SlotStatusEnum } from '../../modules/timeSlot/domain/enums/SlotStatusEnum';

describe('TimeSlotService E2E Tests', () => {
  let app: INestApplication;
  let timeSlotService: TimeSlotService;
  let timeSlotRepository: TimeSlotRepository;
  let doctorRepository: DoctorRepository;
  let dataSource: DataSource;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const testSetup = await TestAppHelper.createTestApp([
      TimeSlotService,
      TimeSlotRepository,
      timeSlotRepositoryProvider,
      DoctorRepository,
      doctorRepositoryProvider,
    ]);

    app = testSetup.app;
    dataSource = testSetup.dataSource;
    cleanup = testSetup.cleanup;

    timeSlotService = app.get<TimeSlotService>(TimeSlotService);
    timeSlotRepository = app.get<TimeSlotRepository>(TimeSlotRepository);
    doctorRepository = app.get<DoctorRepository>(DoctorRepository);
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await TestAppHelper.closeTestApp(app, dataSource);
  });

  describe('createTimeSlot', () => {
    it('should create a time slot successfully', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const createTimeSlotDto: CreateTimeSlotDto = {
        slotDate: tomorrow.toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '10:00:00',
      };

      // Act
      const result = await timeSlotService.createTimeSlot(
        savedDoctor.id,
        createTimeSlotDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.doctorId).toBe(savedDoctor.id);
      expect(result.startTime).toBe('09:00:00');
      expect(result.endTime).toBe('10:00:00');
      expect(result.status).toBe(SlotStatusEnum.AVAILABLE);
    });

    it('should throw BadRequestException for past dates', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const createTimeSlotDto: CreateTimeSlotDto = {
        slotDate: yesterday.toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '10:00:00',
      };

      // Act & Assert
      await expect(
        timeSlotService.createTimeSlot(savedDoctor.id, createTimeSlotDto),
      ).rejects.toThrow('Cannot create time slots for past dates');
    });

    it('should throw BadRequestException if end time is before start time', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const createTimeSlotDto: CreateTimeSlotDto = {
        slotDate: tomorrow.toISOString().split('T')[0],
        startTime: '10:00:00',
        endTime: '09:00:00', // Invalid: before start time
      };

      // Act & Assert
      await expect(
        timeSlotService.createTimeSlot(savedDoctor.id, createTimeSlotDto),
      ).rejects.toThrow('End time must be after start time');
    });
  });

  describe('createBulkTimeSlots', () => {
    it('should create multiple time slots successfully', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const createBulkTimeSlotsDto: CreateBulkTimeSlotsDto = {
        timeSlots: [
          {
            slotDate: dateStr,
            startTime: '09:00:00',
            endTime: '10:00:00',
          },
          {
            slotDate: dateStr,
            startTime: '10:00:00',
            endTime: '11:00:00',
          },
          {
            slotDate: dateStr,
            startTime: '11:00:00',
            endTime: '12:00:00',
          },
        ],
      };

      // Act
      const result = await timeSlotService.createBulkTimeSlots(
        savedDoctor.id,
        createBulkTimeSlotsDto,
      );

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].startTime).toBe('09:00:00');
      expect(result[1].startTime).toBe('10:00:00');
      expect(result[2].startTime).toBe('11:00:00');
      expect(result.every((slot) => slot.doctorId === savedDoctor.id)).toBe(
        true,
      );
      expect(
        result.every((slot) => slot.status === SlotStatusEnum.AVAILABLE),
      ).toBe(true);
    });

    it('should throw BadRequestException if any slot is invalid', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const createBulkTimeSlotsDto: CreateBulkTimeSlotsDto = {
        timeSlots: [
          {
            slotDate: dateStr, // Invalid: past date
            startTime: '09:00:00',
            endTime: '10:00:00',
          },
        ],
      };

      // Act & Assert
      await expect(
        timeSlotService.createBulkTimeSlots(
          savedDoctor.id,
          createBulkTimeSlotsDto,
        ),
      ).rejects.toThrow('Cannot create time slots for past dates');
    });
  });

  describe('getDoctorTimeSlots', () => {
    it('should return all time slots for a doctor', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlots = TestDataFactory.generateMultipleTimeSlots(
        savedDoctor.id,
        3,
      );
      for (const slot of timeSlots) {
        await timeSlotRepository.save(slot);
      }

      // Act
      const result = await timeSlotService.getDoctorTimeSlots(savedDoctor.id);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every((slot) => slot.doctorId === savedDoctor.id)).toBe(
        true,
      );
    });

    it('should return empty array if doctor has no time slots', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      // Act
      const result = await timeSlotService.getDoctorTimeSlots(savedDoctor.id);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should return only available time slots', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      // Create available slot
      const availableSlot = TestDataFactory.createTimeSlot(savedDoctor.id, {
        status: SlotStatusEnum.AVAILABLE,
      });
      await timeSlotRepository.save(availableSlot);

      // Create booked slot
      const bookedSlot = TestDataFactory.createTimeSlot(savedDoctor.id, {
        status: SlotStatusEnum.BOOKED,
        startTime: '10:00:00',
        endTime: '11:00:00',
      });
      await timeSlotRepository.save(bookedSlot);

      // Act
      const result = await timeSlotService.getAvailableTimeSlots(
        savedDoctor.id,
      );

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].status).toBe(SlotStatusEnum.AVAILABLE);
    });
  });

  describe('cancelTimeSlot', () => {
    it('should cancel an available time slot', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor.id, {
        status: SlotStatusEnum.AVAILABLE,
      });
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      // Act
      await timeSlotService.cancelTimeSlot(
        savedTimeSlot.id,
        savedDoctor.id,
      );

      // Assert
      const updatedSlot = await timeSlotRepository.findById(savedTimeSlot.id);
      expect(updatedSlot?.status).toBe(SlotStatusEnum.CANCELLED);
    });

    it('should throw NotFoundException for non-existent time slot', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      // Act & Assert
      await expect(
        timeSlotService.cancelTimeSlot(99999, savedDoctor.id),
      ).rejects.toThrow('Time slot not found');
    });

    it('should throw BadRequestException if trying to cancel another doctors slot', async () => {
      // Arrange
      const doctor1 = await TestDataFactory.createDoctor(1);
      const doctor2 = await TestDataFactory.createDoctor(1);
      const savedDoctor1 = await doctorRepository.save(doctor1);
      const savedDoctor2 = await doctorRepository.save(doctor2);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor1.id);
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      // Act & Assert - doctor2 trying to cancel doctor1's slot
      await expect(
        timeSlotService.cancelTimeSlot(savedTimeSlot.id, savedDoctor2.id),
      ).rejects.toThrow('You are not authorized to cancel this time slot');
    });

    it('should throw BadRequestException if trying to cancel a booked slot', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1);
      const savedDoctor = await doctorRepository.save(doctor);

      const timeSlot = TestDataFactory.createTimeSlot(savedDoctor.id, {
        status: SlotStatusEnum.BOOKED,
      });
      const savedTimeSlot = await timeSlotRepository.save(timeSlot);

      // Act & Assert
      await expect(
        timeSlotService.cancelTimeSlot(savedTimeSlot.id, savedDoctor.id),
      ).rejects.toThrow(
        'Cannot cancel a booked time slot. Please cancel the appointment first.',
      );
    });
  });
});
