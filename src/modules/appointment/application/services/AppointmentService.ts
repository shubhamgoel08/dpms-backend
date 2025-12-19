import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { AppointmentEntity } from '../../domain/entities/AppointmentEntity';

@Injectable()
export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async findById(appointmentId: number): Promise<AppointmentEntity> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findByDoctorId(doctorId: number): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository.findByDoctorId(doctorId);
  }

  async findByPatientId(patientId: number): Promise<AppointmentEntity[]> {
    return await this.appointmentRepository.findByPatientId(patientId);
  }

  async save(appointmentEntity: AppointmentEntity): Promise<AppointmentEntity> {
    return await this.appointmentRepository.save(appointmentEntity);
  }

  async getMostBookedDoctors(limit: number = 10): Promise<any[]> {
    return await this.appointmentRepository.getMostBookedDoctors(limit);
  }

  async getMostBookedSpecialities(limit: number = 10): Promise<any[]> {
    return await this.appointmentRepository.getMostBookedSpecialities(limit);
  }

  async getMostBookedTimeSlots(limit: number = 10): Promise<any[]> {
    return await this.appointmentRepository.getMostBookedTimeSlots(limit);
  }
}
