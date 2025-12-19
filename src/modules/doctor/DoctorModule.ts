import { Module } from '@nestjs/common';
import {
  DoctorRepository,
  doctorRepositoryProvider,
} from './domain/repositories/DoctorRepository';
import { DoctorService } from './application/services/DoctorService';
import { DoctorController } from './application/controllers/DoctorController';
import { DatabaseModule } from '../../config/DatabaseModule';

@Module({
  imports: [DatabaseModule],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository, doctorRepositoryProvider],
  exports: [DoctorService],
})
export class DoctorModule {}
