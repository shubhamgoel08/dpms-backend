import {Module, MiddlewareConsumer, NestModule} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {APP_FILTER, APP_INTERCEPTOR, APP_PIPE} from '@nestjs/core'
import {Request, Response, NextFunction} from 'express'

import configuration from './config/configuration'
import {DatabaseModule} from './modules/database/database.module'
import {SharedModule} from './modules/shared/shared.module'
import {PatientModule} from './modules/patient/patient.module'
import {DoctorModule} from './modules/doctor/doctor.module'
import {AppointmentModule} from './modules/appointment/appointment.module'
import {AuthModule} from './modules/auth/auth.module'
import {NotificationModule} from './modules/notification/notification.module'
import {HealthModule} from './modules/health/health.module'
import {MetricsModule} from './modules/metrics/metrics.module'
import {AllExceptionsFilter} from './modules/shared/filters/AllExceptionsFilter'
import {LoggingInterceptor} from './modules/shared/interceptors/LoggingInterceptor'
import {CustomValidationPipe} from './modules/shared/validation/ValidationPipe'
import {PerformanceLogStore, IQueryInfo} from './modules/shared/performanceLog/PerformanceLogStore'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    SharedModule,
    AuthModule,
    PatientModule,
    DoctorModule,
    AppointmentModule,
    NotificationModule,
    HealthModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.performanceTrackingMiddleware)
      .forRoutes('*')
  }

  private performanceTrackingMiddleware(
    _req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    const queries: IQueryInfo[] = []
    PerformanceLogStore.storage.run({queries}, () => next())
  }
}
