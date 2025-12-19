import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {DoctorEntity} from './domain/entities/DoctorEntity'
import {TimeSlotEntity} from './domain/entities/TimeSlotEntity'
import {DoctorRepository} from './domain/repositories/DoctorRepository'
import {TimeSlotRepository} from './domain/repositories/TimeSlotRepository'
import {DoctorService} from './application/services/DoctorService'
import {DoctorController} from './application/controllers/DoctorController'

@Module({
  imports: [TypeOrmModule.forFeature([DoctorEntity, TimeSlotEntity])],
  controllers: [DoctorController],
  providers: [DoctorRepository, TimeSlotRepository, DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}

