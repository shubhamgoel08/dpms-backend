import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from '../../domain/repositories/AdminRepository';
import { DoctorService } from '../../../doctor/application/services/DoctorService';
import { DoctorEntity } from '../../../doctor/domain/entities/DoctorEntity';
import { CreateDoctorDto } from '../dtos/CreateDoctorDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly doctorService: DoctorService,
  ) {}

  async createDoctor(
    createDoctorDto: CreateDoctorDto,
    adminId: number,
  ): Promise<DoctorEntity> {
    const existingDoctor = await this.doctorService.findByEmail(
      createDoctorDto.email,
    );

    if (existingDoctor) {
      throw new ConflictException('Doctor with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createDoctorDto.password, 10);

    const doctorEntity = new DoctorEntity();
    doctorEntity.email = createDoctorDto.email;
    doctorEntity.passwordHash = passwordHash;
    doctorEntity.name = createDoctorDto.name;
    doctorEntity.speciality = createDoctorDto.speciality;
    doctorEntity.phone = createDoctorDto.phone;
    doctorEntity.experienceYears = createDoctorDto.experienceYears;
    doctorEntity.createdByAdminId = adminId;

    return await this.doctorService.save(doctorEntity);
  }

  async getAllDoctors(): Promise<DoctorEntity[]> {
    return await this.doctorService.findAll();
  }

  async getDoctorById(doctorId: number): Promise<DoctorEntity> {
    return await this.doctorService.findById(doctorId);
  }

  async findByEmail(email: string) {
    return await this.adminRepository.findByEmail(email);
  }

  async findById(adminId: number) {
    return await this.adminRepository.findById(adminId);
  }
}
