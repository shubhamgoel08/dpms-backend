import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthService } from '../../modules/auth/application/services/AuthService';
import { AdminRepository, adminRepositoryProvider } from '../../modules/admin/domain/repositories/AdminRepository';
import { DoctorRepository, doctorRepositoryProvider } from '../../modules/doctor/domain/repositories/DoctorRepository';
import { TestAppHelper } from '../helpers/TestAppHelper';
import { TestDataFactory } from '../helpers/TestDataFactory';
import { UserRoleEnum } from '../../modules/auth/domain/enums/UserRoleEnum';

describe('AuthService E2E Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let adminRepository: AdminRepository;
  let doctorRepository: DoctorRepository;
  let dataSource: DataSource;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const testSetup = await TestAppHelper.createTestApp([
      AuthService,
      AdminRepository,
      adminRepositoryProvider,
      DoctorRepository,
      doctorRepositoryProvider,
      {
        provide: JwtService,
        useValue: jwtService,
      },
    ]);

    app = testSetup.app;
    dataSource = testSetup.dataSource;
    cleanup = testSetup.cleanup;

    const moduleFixture = app.get(TestingModule);
    authService = moduleFixture.get<AuthService>(AuthService);
    adminRepository = moduleFixture.get<AdminRepository>(AdminRepository);
    doctorRepository = moduleFixture.get<DoctorRepository>(DoctorRepository);
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await TestAppHelper.closeTestApp(app, dataSource);
  });

  describe('validateAdmin', () => {
    it('should validate admin with correct credentials', async () => {
      // Arrange
      const admin = await TestDataFactory.createAdmin({
        email: 'admin@test.com',
        name: 'Test Admin',
      });
      await adminRepository.save(admin);

      // Act
      const result = await authService.validateAdmin(
        'admin@test.com',
        'TestPassword123',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe('admin@test.com');
      expect(result?.name).toBe('Test Admin');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null for invalid admin email', async () => {
      // Act
      const result = await authService.validateAdmin(
        'nonexistent@test.com',
        'Password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid admin password', async () => {
      // Arrange
      const admin = await TestDataFactory.createAdmin({
        email: 'admin2@test.com',
      });
      await adminRepository.save(admin);

      // Act
      const result = await authService.validateAdmin(
        'admin2@test.com',
        'WrongPassword',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('validateDoctor', () => {
    it('should validate doctor with correct credentials', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'doctor@test.com',
        name: 'Dr. Test',
      });
      await doctorRepository.save(doctor);

      // Act
      const result = await authService.validateDoctor(
        'doctor@test.com',
        'TestPassword123',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe('doctor@test.com');
      expect(result?.name).toBe('Dr. Test');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null for invalid doctor email', async () => {
      // Act
      const result = await authService.validateDoctor(
        'nonexistent@test.com',
        'Password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid doctor password', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'doctor2@test.com',
      });
      await doctorRepository.save(doctor);

      // Act
      const result = await authService.validateDoctor(
        'doctor2@test.com',
        'WrongPassword',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate JWT token for admin login', async () => {
      // Arrange
      const admin = await TestDataFactory.createAdmin({
        email: 'loginadmin@test.com',
      });
      const savedAdmin = await adminRepository.save(admin);

      // Act
      const result = await authService.login(savedAdmin.id, UserRoleEnum.ADMIN);

      // Assert
      expect(result).toBeDefined();
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should generate JWT token for doctor login', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'logindoctor@test.com',
      });
      const savedDoctor = await doctorRepository.save(doctor);

      // Act
      const result = await authService.login(
        savedDoctor.id,
        UserRoleEnum.DOCTOR,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.access_token).toBe('mock-jwt-token');
    });
  });

  describe('admin login flow', () => {
    it('should complete full admin login flow', async () => {
      // Arrange
      const admin = await TestDataFactory.createAdmin({
        email: 'fullflow@test.com',
        name: 'Full Flow Admin',
      });
      await adminRepository.save(admin);

      // Act - Validate
      const validatedAdmin = await authService.validateAdmin(
        'fullflow@test.com',
        'TestPassword123',
      );

      expect(validatedAdmin).toBeDefined();

      // Act - Login
      const loginResult = await authService.login(
        validatedAdmin!.id,
        UserRoleEnum.ADMIN,
      );

      // Assert
      expect(loginResult).toBeDefined();
      expect(loginResult.access_token).toBe('mock-jwt-token');
    });
  });

  describe('doctor login flow', () => {
    it('should complete full doctor login flow', async () => {
      // Arrange
      const doctor = await TestDataFactory.createDoctor(1, {
        email: 'doctorflow@test.com',
        name: 'Dr. Full Flow',
      });
      await doctorRepository.save(doctor);

      // Act - Validate
      const validatedDoctor = await authService.validateDoctor(
        'doctorflow@test.com',
        'TestPassword123',
      );

      expect(validatedDoctor).toBeDefined();

      // Act - Login
      const loginResult = await authService.login(
        validatedDoctor!.id,
        UserRoleEnum.DOCTOR,
      );

      // Assert
      expect(loginResult).toBeDefined();
      expect(loginResult.access_token).toBe('mock-jwt-token');
    });
  });
});
