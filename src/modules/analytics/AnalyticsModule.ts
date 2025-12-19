import { Module } from '@nestjs/common';
import { AnalyticsController } from './application/controllers/AnalyticsController';
import { AnalyticsService } from './application/services/AnalyticsService';
import { AppointmentModule } from '../appointment/AppointmentModule';

@Module({
  imports: [AppointmentModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
