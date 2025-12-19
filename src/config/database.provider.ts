import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AdminEntity } from '../modules/admin/domain/entities/AdminEntity';
import { DoctorEntity } from '../modules/doctor/domain/entities/DoctorEntity';
import { TimeSlotEntity } from '../modules/timeSlot/domain/entities/TimeSlotEntity';
import { AppointmentEntity } from '../modules/appointment/domain/entities/AppointmentEntity';
import { ErrorLogEntity } from '../common/entities/ErrorLogEntity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [
          AdminEntity,
          DoctorEntity,
          TimeSlotEntity,
          AppointmentEntity,
          ErrorLogEntity,
        ],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        charset: 'utf8mb4',
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
