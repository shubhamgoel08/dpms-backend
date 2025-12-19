import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {PatientEntity} from './domain/entities/PatientEntity'
import {PatientRepository} from './domain/repositories/PatientRepository'
import {PatientService} from './application/services/PatientService'
import {PatientController} from './application/controllers/PatientController'

@Module({
  imports: [TypeOrmModule.forFeature([PatientEntity])],
  controllers: [PatientController],
  providers: [PatientRepository, PatientService],
  exports: [PatientService],
})
export class PatientModule {}
