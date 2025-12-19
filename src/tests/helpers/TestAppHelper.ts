import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TestDatabaseHelper } from './TestDatabaseHelper';
import { AdminEntity } from '../../modules/admin/domain/entities/AdminEntity';
import { DoctorEntity } from '../../modules/doctor/domain/entities/DoctorEntity';
import { TimeSlotEntity } from '../../modules/timeSlot/domain/entities/TimeSlotEntity';
import { AppointmentEntity } from '../../modules/appointment/domain/entities/AppointmentEntity';
import { ErrorLogEntity } from '../../common/entities/ErrorLogEntity';

export interface TestAppSetup {
  app: INestApplication;
  dataSource: DataSource;
  cleanup: () => Promise<void>;
}

export class TestAppHelper {
  static async createTestApp(
    providers: any[] = [],
    imports: any[] = [],
  ): Promise<TestAppSetup> {
    const mysqlContainer = await TestDatabaseHelper.setupTestMysql();
    const dbConfig = await TestDatabaseHelper.getMysqlConfig();

    const dataSourceProvider = {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        const testDataSource = new DataSource({
          type: 'mysql',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [
            AdminEntity,
            DoctorEntity,
            TimeSlotEntity,
            AppointmentEntity,
            ErrorLogEntity,
          ],
          synchronize: true, // Auto-create tables for testing
          logging: false,
        });

        return await testDataSource.initialize();
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ...imports,
      ],
      providers: [dataSourceProvider, ...providers],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const dataSource = moduleFixture.get<DataSource>('DATA_SOURCE');

    const cleanup = async () => {
      // Clean up data
      if (dataSource) {
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
        await dataSource.query('DELETE FROM appointments');
        await dataSource.query('DELETE FROM time_slots');
        await dataSource.query('DELETE FROM doctors');
        await dataSource.query('DELETE FROM admins');
        await dataSource.query('DELETE FROM error_logs');
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      }
    };

    return { app, dataSource, cleanup };
  }

  static async closeTestApp(app: INestApplication, dataSource: DataSource) {
    if (dataSource) {
      await dataSource.destroy();
    }
    await app.close();
    await TestDatabaseHelper.teardownTestMysql();
  }
}
