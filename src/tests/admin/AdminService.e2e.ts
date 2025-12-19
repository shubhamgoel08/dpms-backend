import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AdminService } from '../../modules/admin/application/services/AdminService';
import { AdminRepository } from '../../modules/admin/domain/repositories/AdminRepository';
import { DoctorService } from '../../modules/doctor/application/services/DoctorService';
import { DoctorRepository } from '../../modules/doctor/domain/repositories/DoctorRepository';
import { TestDatabaseHelper } from '../helpers/TestDatabaseHelper';
import { CreateDoctorDto } from '../../modules/admin/application/dtos/CreateDoctorDto';
import { SpecialityEnum } from '../../modules/doctor/domain/enums/SpecialityEnum';
import { StartedTestContainer } from 'testcontainers';

describe('AdminService E2E Tests', () => {
  let app: INestApplication;
  let adminService: AdminService;
  let doctorService: DoctorService;
  let dataSource: DataSource;
  let mysqlContainer: StartedTestContainer;

  beforeAll(async () => {
    // Setup test database using Testcontainers
    mysqlContainer = await TestDatabaseHelper.setupTestMysql();
    const dbConfig = await TestDatabaseHelper.getMysqlConfig();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        AdminService,
        AdminRepository,
        DoctorService,
        DoctorRepository,
        {
          provide: 'DATA_SOURCE',
          useFactory: async () => {
            const testDataSource = new DataSource({
              type: 'mysql',
              host: dbConfig.host,
              port: dbConfig.port,
              username: dbConfig.username,
              password: dbConfig.password,
              database: dbConfig.database,
              entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
              synchronize: true, // Auto-create tables for testing
              logging: false,
            });

            return await testDataSource.initialize();
          },
        },
        {
          provide: 'ADMIN_REPOSITORY',
          useFactory: (dataSource: DataSource) => {
            return dataSource.getRepository('AdminEntity');
          },
          inject: ['DATA_SOURCE'],
        },
        {
          provide: 'DOCTOR_REPOSITORY',
          useFactory: (dataSource: DataSource) => {
            return dataSource.getRepository('DoctorEntity');
          },
          inject: ['DATA_SOURCE'],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    adminService = moduleFixture.get<AdminService>(AdminService);
    doctorService = moduleFixture.get<DoctorService>(DoctorService);
    dataSource = moduleFixture.get<DataSource>('DATA_SOURCE');
  });

  afterEach(async () => {
    // Clean up data after each test
    if (dataSource) {
      await dataSource.query('DELETE FROM doctors');
      await dataSource.query('DELETE FROM admins');
    }
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    await app.close();
    await TestDatabaseHelper.teardownTestMysql();
  });

  describe('createDoctor', () => {
    it('should create a new doctor successfully', async () => {
      // Arrange
      const createDoctorDto: CreateDoctorDto = {
        email: 'doctor@example.com',
        password: 'SecurePassword123',
        name: 'Dr. John Doe',
        speciality: SpecialityEnum.CARDIOLOGY,
        phone: '+1234567890',
        experienceYears: 10,
      };

      // Act
      const createdDoctor = await adminService.createDoctor(
        createDoctorDto,
        1,
      );

      // Assert
      expect(createdDoctor).toBeDefined();
      expect(createdDoctor.id).toBeDefined();
      expect(createdDoctor.email).toBe(createDoctorDto.email);
      expect(createdDoctor.name).toBe(createDoctorDto.name);
      expect(createdDoctor.speciality).toBe(createDoctorDto.speciality);
      expect(createdDoctor.passwordHash).toBeDefined();
      expect(createdDoctor.passwordHash).not.toBe(createDoctorDto.password);
    });

    it('should throw ConflictException if doctor email already exists', async () => {
      // Arrange
      const createDoctorDto: CreateDoctorDto = {
        email: 'duplicate@example.com',
        password: 'SecurePassword123',
        name: 'Dr. Jane Smith',
        speciality: SpecialityEnum.NEUROLOGY,
        phone: '+1234567891',
        experienceYears: 8,
      };

      // Create first doctor
      await adminService.createDoctor(createDoctorDto, 1);

      // Act & Assert
      await expect(
        adminService.createDoctor(createDoctorDto, 1),
      ).rejects.toThrow('Doctor with this email already exists');
    });
  });

  describe('getAllDoctors', () => {
    it('should return all doctors', async () => {
      // Arrange - Create multiple doctors
      const doctor1: CreateDoctorDto = {
        email: 'doctor1@example.com',
        password: 'Password123',
        name: 'Dr. Alice',
        speciality: SpecialityEnum.PEDIATRICS,
        phone: '+1111111111',
        experienceYears: 5,
      };

      const doctor2: CreateDoctorDto = {
        email: 'doctor2@example.com',
        password: 'Password456',
        name: 'Dr. Bob',
        speciality: SpecialityEnum.ORTHOPEDICS,
        phone: '+2222222222',
        experienceYears: 12,
      };

      await adminService.createDoctor(doctor1, 1);
      await adminService.createDoctor(doctor2, 1);

      // Act
      const doctors = await adminService.getAllDoctors();

      // Assert
      expect(doctors).toHaveLength(2);
      expect(doctors[0].email).toBeDefined();
      expect(doctors[1].email).toBeDefined();
    });
  });

  describe('getDoctorById', () => {
    it('should return doctor by id', async () => {
      // Arrange
      const createDoctorDto: CreateDoctorDto = {
        email: 'finddoctor@example.com',
        password: 'Password789',
        name: 'Dr. Charlie',
        speciality: SpecialityEnum.DERMATOLOGY,
        phone: '+3333333333',
        experienceYears: 7,
      };

      const createdDoctor = await adminService.createDoctor(
        createDoctorDto,
        1,
      );

      // Act
      const foundDoctor = await adminService.getDoctorById(createdDoctor.id);

      // Assert
      expect(foundDoctor).toBeDefined();
      expect(foundDoctor.id).toBe(createdDoctor.id);
      expect(foundDoctor.email).toBe(createDoctorDto.email);
    });

    it('should throw NotFoundException if doctor does not exist', async () => {
      // Act & Assert
      await expect(adminService.getDoctorById(99999)).rejects.toThrow(
        'Doctor not found',
      );
    });
  });
});
