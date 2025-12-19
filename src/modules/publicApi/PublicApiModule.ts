import { Module } from '@nestjs/common';
import { PublicApiController } from './application/controllers/PublicApiController';
import { PublicApiService } from './application/services/PublicApiService';
import { DoctorModule } from '../doctor/DoctorModule';
import { TimeSlotModule } from '../timeSlot/TimeSlotModule';

@Module({
  imports: [DoctorModule, TimeSlotModule],
  controllers: [PublicApiController],
  providers: [PublicApiService],
  exports: [PublicApiService],
})
export class PublicApiModule {}
