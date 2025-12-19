import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {ConfigModule, ConfigService} from '@nestjs/config'

import {PatientEntity} from '../patient/domain/entities/PatientEntity'
import {DoctorEntity} from '../doctor/domain/entities/DoctorEntity'
import {TimeSlotEntity} from '../doctor/domain/entities/TimeSlotEntity'
import {AppointmentEntity} from '../appointment/domain/entities/AppointmentEntity'
import {ErrorLogEntity} from '../shared/entities/ErrorLogEntity'
import {PerformanceLogEntity} from '../shared/entities/PerformanceLogEntity'

const entities = [
  PatientEntity,
  DoctorEntity,
  TimeSlotEntity,
  AppointmentEntity,
  ErrorLogEntity,
  PerformanceLogEntity,
]

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        socketPath: '/tmp/mysql.sock',
        username: configService.get<string>('database.username') ?? 'root',
        password: configService.get<string>('database.password') ?? '',
        database: configService.get<string>('database.name') ?? 'doctor_patient_db',
        entities,
        synchronize: configService.get<string>('nodeEnv') === 'development',
        logging: configService.get<string>('nodeEnv') === 'development',
        charset: 'utf8mb4',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
