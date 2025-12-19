import { Module } from '@nestjs/common';
import { TimeSlotController } from './application/controllers/TimeSlotController';
import { TimeSlotService } from './application/services/TimeSlotService';
import {
  TimeSlotRepository,
  timeSlotRepositoryProvider,
} from './domain/repositories/TimeSlotRepository';
import { DatabaseModule } from '../../config/DatabaseModule';

@Module({
  imports: [DatabaseModule],
  controllers: [TimeSlotController],
  providers: [
    TimeSlotService,
    TimeSlotRepository,
    timeSlotRepositoryProvider,
  ],
  exports: [TimeSlotService],
})
export class TimeSlotModule {}
