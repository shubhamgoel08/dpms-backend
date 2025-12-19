import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorRepository } from '../../domain/repositories/DoctorRepository';
import { DoctorEntity } from '../../domain/entities/DoctorEntity';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async findById(doctorId: number): Promise<DoctorEntity> {
    const doctor = await this.doctorRepository.findById(doctorId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findByEmail(email: string): Promise<DoctorEntity | null> {
    return await this.doctorRepository.findByEmail(email);
  }

  async findAll(): Promise<DoctorEntity[]> {
    return await this.doctorRepository.findAll();
  }

  async save(doctorEntity: DoctorEntity): Promise<DoctorEntity> {
    return await this.doctorRepository.save(doctorEntity);
  }

  async delete(doctorId: number): Promise<void> {
    const doctor = await this.findById(doctorId);
    await this.doctorRepository.delete(doctor);
  }
}
