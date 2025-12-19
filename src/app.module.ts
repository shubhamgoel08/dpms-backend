import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './config/DatabaseModule';
import { AdminModule } from './modules/admin/AdminModule';
import { DoctorModule } from './modules/doctor/DoctorModule';
import { AuthModule } from './modules/auth/AuthModule';
import { TimeSlotModule } from './modules/timeSlot/TimeSlotModule';
import { AppointmentModule } from './modules/appointment/AppointmentModule';
import { AnalyticsModule } from './modules/analytics/AnalyticsModule';
import { PublicApiModule } from './modules/publicApi/PublicApiModule';
import { AllExceptionsFilter } from './common/filters/AllExceptionsFilter';
import { HealthController } from './common/controllers/HealthController';
import { ErrorLogService } from './common/services/ErrorLogService';
import {
  ErrorLogRepository,
  errorLogRepositoryProvider,
} from './common/repositories/ErrorLogRepository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    PrometheusModule.register(),
    TerminusModule,
    DatabaseModule,
    AuthModule,
    AdminModule,
    DoctorModule,
    TimeSlotModule,
    AppointmentModule,
    AnalyticsModule,
    PublicApiModule,
  ],
  controllers: [HealthController],
  providers: [
    ErrorLogService,
    ErrorLogRepository,
    errorLogRepositoryProvider,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
