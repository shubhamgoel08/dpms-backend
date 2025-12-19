import { Module } from '@nestjs/common';
import { AdminController } from './application/controllers/AdminController';
import { AdminService } from './application/services/AdminService';
import {
  AdminRepository,
  adminRepositoryProvider,
} from './domain/repositories/AdminRepository';
import { DoctorModule } from '../doctor/DoctorModule';
import { DatabaseModule } from '../../config/DatabaseModule';

@Module({
  imports: [DatabaseModule, DoctorModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, adminRepositoryProvider],
  exports: [AdminService],
})
export class AdminModule {}
