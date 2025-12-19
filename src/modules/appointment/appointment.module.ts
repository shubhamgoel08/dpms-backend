import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {AppointmentEntity} from './domain/entities/AppointmentEntity'
import {AppointmentRepository} from './domain/repositories/AppointmentRepository'
import {AppointmentService} from './application/services/AppointmentService'
import {AppointmentController} from './application/controllers/AppointmentController'
import {DoctorModule} from '@modules/doctor/doctor.module'
import {NotificationModule} from '@modules/notification/notification.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity]),
    DoctorModule,
    NotificationModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentRepository, AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

