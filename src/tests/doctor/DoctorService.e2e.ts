import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DoctorService } from '../../modules/doctor/application/services/DoctorService';
import { DoctorRepository, doctorRepositoryProvider } from '../../modules/doctor/domain/repositories/DoctorRepository';
import { TestAppHelper } from '../helpers/TestAppHelper';
import { TestDataFactory } from '../helpers/TestDataFactory';
import { SpecialityEnum } from '../../modules/doctor/domain/enums/SpecialityEnum';

describe('DoctorService E2E Tests', () => {
  let app: INestApplication;
  let doctorService: DoctorService;
  let doctorRepository: DoctorRepository;
  let dataSource: DataSource;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const testSetup = await TestAppHelper.createTestApp([
      DoctorService,
      DoctorRepository,
      doctorRepositoryProvider,
    ]);

    app = testSetup.app;
    dataSource = testSetup.dataSource;
    cleanup = testSetup.cleanup;

    doctorService = app.get<DoctorService>(DoctorService);
    doctorRepository = app.get<DoctorRepository>(DoctorRepository);
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await TestAppHelper.closeTestApp(app, dataSource);
  });

  describe('findById', () => {
    it('should find doctor by id', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'findbyid@test.com',
        name: 'Dr. Find By Id',
      });
      const savedDoctor = await doctorRepository.save(doctor);

      // Act
      const result = await doctorService.findById(savedDoctor.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(savedDoctor.id);
      expect(result.email).toBe('findbyid@test.com');
      expect(result.name).toBe('Dr. Find By Id');
    });

    it('should throw NotFoundException for non-existent doctor', async () => {
      // Act & Assert
      await expect(doctorService.findById(99999)).rejects.toThrow(
        'Doctor not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should find doctor by email', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'findbyemail@test.com',
        name: 'Dr. Find By Email',
      });
      await doctorRepository.save(doctor);

      // Act
      const result = await doctorService.findByEmail('findbyemail@test.com');

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe('findbyemail@test.com');
      expect(result?.name).toBe('Dr. Find By Email');
    });

    it('should return null for non-existent email', async () => {
      // Act
      const result = await doctorService.findByEmail('nonexistent@test.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all doctors', async () => {
      // Arrange
      const doctors = await TestDataFactory.generateMultipleDoctors(3, 1);
      for (const doctor of doctors) {
        await doctorRepository.save(doctor);
      }

      // Act
      const result = await doctorService.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].email).toBeDefined();
      expect(result[1].email).toBeDefined();
      expect(result[2].email).toBeDefined();
    });

    it('should return empty array when no doctors exist', async () => {
      // Act
      const result = await doctorService.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save a new doctor', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'save@test.com',
        name: 'Dr. Save',
        speciality: SpecialityEnum.CARDIOLOGY,
      });

      // Act
      const result = await doctorService.save(doctor);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe('save@test.com');
      expect(result.speciality).toBe(SpecialityEnum.CARDIOLOGY);
    });

    it('should update existing doctor', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'update@test.com',
        name: 'Dr. Before Update',
      });
      const savedDoctor = await doctorRepository.save(doctor);

      // Modify doctor
      savedDoctor.name = 'Dr. After Update';
      savedDoctor.experienceYears = 15;

      // Act
      const result = await doctorService.save(savedDoctor);

      // Assert
      expect(result.id).toBe(savedDoctor.id);
      expect(result.name).toBe('Dr. After Update');
      expect(result.experienceYears).toBe(15);
    });
  });

  describe('delete', () => {
    it('should delete a doctor', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'delete@test.com',
        name: 'Dr. Delete',
      });
      const savedDoctor = await doctorRepository.save(doctor);

      // Act
      await doctorService.delete(savedDoctor.id);

      // Assert - verify doctor is deleted
      const result = await doctorRepository.findById(savedDoctor.id);
      expect(result).toBeNull();
    });

    it('should throw NotFoundException when deleting non-existent doctor', async () => {
      // Act & Assert
      await expect(doctorService.delete(99999)).rejects.toThrow(
        'Doctor not found',
      );
    });
  });

  describe('doctor specialities', () => {
    it('should save doctors with different specialities', async () => {
      // Arrange & Act
      const cardiologist = await TestDataFactory.createDoctor(1, {
        email: 'cardio@test.com',
        speciality: SpecialityEnum.CARDIOLOGY,
      });
      const neurologist = await TestDataFactory.createDoctor(1, {
        email: 'neuro@test.com',
        speciality: SpecialityEnum.NEUROLOGY,
      });
      const pediatrician = await TestDataFactory.createDoctor(1, {
        email: 'pedia@test.com',
        speciality: SpecialityEnum.PEDIATRICS,
      });

      await doctorService.save(cardiologist);
      await doctorService.save(neurologist);
      await doctorService.save(pediatrician);

      // Assert
      const allDoctors = await doctorService.findAll();
      expect(allDoctors).toHaveLength(3);

      const specialities = allDoctors.map((d) => d.speciality);
      expect(specialities).toContain(SpecialityEnum.CARDIOLOGY);
      expect(specialities).toContain(SpecialityEnum.NEUROLOGY);
      expect(specialities).toContain(SpecialityEnum.PEDIATRICS);
    });
  });

  describe('doctor experience years', () => {
    it('should save and retrieve doctors with varying experience', async () => {
      // Arrange
      const juniorDoctor = await TestDataFactory.createDoctor(1, {
        email: 'junior@test.com',
        experienceYears: 2,
      });
      const midDoctor = await TestDataFactory.createDoctor(1, {
        email: 'mid@test.com',
        experienceYears: 8,
      });
      const seniorDoctor = await TestDataFactory.createDoctor(1, {
        email: 'senior@test.com',
        experienceYears: 20,
      });

      // Act
      await doctorService.save(juniorDoctor);
      await doctorService.save(midDoctor);
      await doctorService.save(seniorDoctor);

      const allDoctors = await doctorService.findAll();

      // Assert
      expect(allDoctors).toHaveLength(3);
      const experienceYears = allDoctors.map((d) => d.experienceYears);
      expect(experienceYears).toContain(2);
      expect(experienceYears).toContain(8);
      expect(experienceYears).toContain(20);
    });
  });
});
