import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository, Between, LessThanOrEqual, MoreThanOrEqual} from 'typeorm'
import {AppointmentEntity} from '../entities/AppointmentEntity'
import {AppointmentStatusEnum} from '../enums/AppointmentStatusEnum'

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  async findById(appointmentId: number): Promise<AppointmentEntity | null> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.id = :appointmentId', {appointmentId})
      .getOne()
  }

  async findByPatientId(patientId: number): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .where('appointment.patientId = :patientId', {patientId})
      .orderBy('appointment.appointmentDate', 'DESC')
      .addOrderBy('appointment.startTime', 'DESC')
      .getMany()
  }

  async findUpcomingByPatientId(patientId: number): Promise<AppointmentEntity[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .where('appointment.patientId = :patientId', {patientId})
      .andWhere('appointment.appointmentDate >= :today', {today})
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED],
      })
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.startTime', 'ASC')
      .getMany()
  }

  async findPastByPatientId(patientId: number): Promise<AppointmentEntity[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .where('appointment.patientId = :patientId', {patientId})
      .andWhere(
        '(appointment.appointmentDate < :today OR appointment.status IN (:...statuses))',
        {
          today,
          statuses: [AppointmentStatusEnum.COMPLETED, AppointmentStatusEnum.CANCELLED],
        },
      )
      .orderBy('appointment.appointmentDate', 'DESC')
      .addOrderBy('appointment.startTime', 'DESC')
      .getMany()
  }

  async save(appointment: AppointmentEntity): Promise<AppointmentEntity> {
    return await this.appointmentRepository.save(appointment)
  }

  async update(appointmentId: number, updateData: Partial<AppointmentEntity>): Promise<void> {
    await this.appointmentRepository.update(appointmentId, updateData)
  }

  async checkSlotAvailability(
    doctorId: number,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: number,
  ): Promise<boolean> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', {doctorId})
      .andWhere('appointment.appointmentDate = :appointmentDate', {appointmentDate})
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED],
      })
      .andWhere(
        '((appointment.startTime <= :startTime AND appointment.endTime > :startTime) OR ' +
          '(appointment.startTime < :endTime AND appointment.endTime >= :endTime) OR ' +
          '(appointment.startTime >= :startTime AND appointment.endTime <= :endTime))',
        {startTime, endTime},
      )

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :excludeAppointmentId', {excludeAppointmentId})
    }

    const count = await queryBuilder.getCount()
    return count === 0
  }

  async findByDoctorIdAndDate(
    doctorId: number,
    date: Date,
  ): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', {doctorId})
      .andWhere('appointment.appointmentDate = :date', {date})
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatusEnum.PENDING, AppointmentStatusEnum.CONFIRMED],
      })
      .orderBy('appointment.startTime', 'ASC')
      .getMany()
  }
}

