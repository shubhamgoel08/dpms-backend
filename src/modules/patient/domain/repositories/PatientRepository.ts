import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {PatientEntity} from '../entities/PatientEntity'

@Injectable()
export class PatientRepository {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,
  ) {}

  async findById(patientId: number): Promise<PatientEntity | null> {
    return await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.id = :patientId', {patientId})
      .getOne()
  }

  async findByEmail(email: string): Promise<PatientEntity | null> {
    return await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.email = :email', {email})
      .getOne()
  }

  async save(patientEntity: PatientEntity): Promise<PatientEntity> {
    return await this.patientRepository.save(patientEntity)
  }

  async update(patientId: number, updateData: Partial<PatientEntity>): Promise<void> {
    await this.patientRepository.update(patientId, updateData)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.email = :email', {email})
      .getCount()
    return count > 0
  }
}
