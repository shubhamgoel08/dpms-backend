import { Module } from '@nestjs/common';
import {
  AppointmentRepository,
  appointmentRepositoryProvider,
} from './domain/repositories/AppointmentRepository';
import { AppointmentService } from './application/services/AppointmentService';
import { AppointmentController } from './application/controllers/AppointmentController';
import { DatabaseModule } from '../../config/DatabaseModule';

@Module({
  imports: [DatabaseModule],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    AppointmentRepository,
    appointmentRepositoryProvider,
  ],
  exports: [AppointmentService],
})
export class AppointmentModule {}
