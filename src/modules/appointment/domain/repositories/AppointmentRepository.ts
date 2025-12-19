import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AppointmentEntity } from '../entities/AppointmentEntity';

export const appointmentRepositoryProvider = {
  provide: 'APPOINTMENT_REPOSITORY',
  useFactory: (dataSource: DataSource): Repository<AppointmentEntity> =>
    dataSource.getRepository(AppointmentEntity),
  inject: ['DATA_SOURCE'],
};

@Injectable()
export class AppointmentRepository {
  constructor(
    @Inject('APPOINTMENT_REPOSITORY')
    private appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  async findById(appointmentId: number): Promise<AppointmentEntity | null> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.id = :appointmentId', { appointmentId })
      .getOne();
  }

  async save(appointmentEntity: AppointmentEntity): Promise<AppointmentEntity> {
    return await this.appointmentRepository.save(appointmentEntity);
  }

  async findByDoctorId(doctorId: number): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.timeSlot', 'timeSlot')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .orderBy('appointment.bookedAt', 'DESC')
      .getMany();
  }

  async findByPatientId(patientId: number): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.timeSlot', 'timeSlot')
      .where('appointment.patientId = :patientId', { patientId })
      .orderBy('appointment.bookedAt', 'DESC')
      .getMany();
  }

  async getMostBookedDoctors(limit: number = 10): Promise<any[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.doctorId', 'doctorId')
      .addSelect('doctor.name', 'doctorName')
      .addSelect('COUNT(appointment.id)', 'bookingCount')
      .leftJoin('appointment.doctor', 'doctor')
      .groupBy('appointment.doctorId')
      .addGroupBy('doctor.name')
      .orderBy('bookingCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getMostBookedSpecialities(limit: number = 10): Promise<any[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('doctor.speciality', 'speciality')
      .addSelect('COUNT(appointment.id)', 'bookingCount')
      .leftJoin('appointment.doctor', 'doctor')
      .groupBy('doctor.speciality')
      .orderBy('bookingCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getMostBookedTimeSlots(limit: number = 10): Promise<any[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('timeSlot.startTime', 'startTime')
      .addSelect('timeSlot.endTime', 'endTime')
      .addSelect('COUNT(appointment.id)', 'bookingCount')
      .leftJoin('appointment.timeSlot', 'timeSlot')
      .groupBy('timeSlot.startTime')
      .addGroupBy('timeSlot.endTime')
      .orderBy('bookingCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
