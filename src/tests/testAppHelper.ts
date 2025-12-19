import {Test, TestingModule} from '@nestjs/testing'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {ConfigModule} from '@nestjs/config'
import {StartedTestContainer} from 'testcontainers'

import {setupTestMysql, teardownTestMysql, getTestDatabaseConfig} from '../../test/setup'
import {AuthModule} from '@modules/auth/auth.module'
import {PatientModule} from '@modules/patient/patient.module'
import {DoctorModule} from '@modules/doctor/doctor.module'
import {AppointmentModule} from '@modules/appointment/appointment.module'
import {NotificationModule} from '@modules/notification/notification.module'
import {SharedModule} from '@modules/shared/shared.module'
import {PatientEntity} from '@modules/patient/domain/entities/PatientEntity'
import {DoctorEntity} from '@modules/doctor/domain/entities/DoctorEntity'
import {TimeSlotEntity} from '@modules/doctor/domain/entities/TimeSlotEntity'
import {AppointmentEntity} from '@modules/appointment/domain/entities/AppointmentEntity'
import {ErrorLogEntity} from '@modules/shared/entities/ErrorLogEntity'
import {PerformanceLogEntity} from '@modules/shared/entities/PerformanceLogEntity'
import configuration from '@config/configuration'

export interface ITestApp {
  app: INestApplication
  module: TestingModule
  container: StartedTestContainer
}

/**
 * Bootstraps a NestJS test application with a real MySQL database (via Testcontainers).
 * This follows the "test like a user" philosophy - testing complete application flows.
 */
export const createTestApp = async (): Promise<ITestApp> => {
  const container = await setupTestMysql()
  const dbConfig = getTestDatabaseConfig(container)

  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration],
      }),
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: [
          PatientEntity,
          DoctorEntity,
          TimeSlotEntity,
          AppointmentEntity,
          ErrorLogEntity,
          PerformanceLogEntity,
        ],
        synchronize: true,
        logging: false,
      }),
      SharedModule,
      PatientModule,
      AuthModule,
      DoctorModule,
      AppointmentModule,
      NotificationModule,
    ],
  }).compile()

  const app = module.createNestApplication()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api')
  await app.init()

  return {app, module, container}
}

/**
 * Cleans up the test application and database container.
 */
export const closeTestApp = async (testApp: ITestApp): Promise<void> => {
  await testApp.app.close()
  await teardownTestMysql()
}

/**
 * Gets a service from the test module.
 */
export const getService = <T>(testApp: ITestApp, serviceClass: new (...args: unknown[]) => T): T => {
  return testApp.module.get<T>(serviceClass)
}

