import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { DoctorEntity } from '../entities/DoctorEntity';
import { SpecialityEnum } from '../enums/SpecialityEnum';

export const doctorRepositoryProvider = {
  provide: 'DOCTOR_REPOSITORY',
  useFactory: (dataSource: DataSource): Repository<DoctorEntity> =>
    dataSource.getRepository(DoctorEntity),
  inject: ['DATA_SOURCE'],
};

export interface DoctorFilterOptions {
  speciality?: SpecialityEnum;
  experienceYearsMin?: number;
  searchTerm?: string;
}

@Injectable()
export class DoctorRepository {
  constructor(
    @Inject('DOCTOR_REPOSITORY')
    private doctorRepository: Repository<DoctorEntity>,
  ) {}

  async findById(doctorId: number): Promise<DoctorEntity | null> {
    return await this.doctorRepository
      .createQueryBuilder('doctor')
      .where('doctor.id = :doctorId', { doctorId })
      .getOne();
  }

  async findByEmail(email: string): Promise<DoctorEntity | null> {
    return await this.doctorRepository
      .createQueryBuilder('doctor')
      .where('doctor.email = :email', { email })
      .getOne();
  }

  async save(doctorEntity: DoctorEntity): Promise<DoctorEntity> {
    return await this.doctorRepository.save(doctorEntity);
  }

  async findAll(filters?: DoctorFilterOptions): Promise<DoctorEntity[]> {
    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor');

    this.applyFilters(queryBuilder, filters);

    return await queryBuilder.getMany();
  }

  async findBySpeciality(speciality: SpecialityEnum): Promise<DoctorEntity[]> {
    return await this.doctorRepository
      .createQueryBuilder('doctor')
      .where('doctor.speciality = :speciality', { speciality })
      .getMany();
  }

  async delete(doctorEntity: DoctorEntity): Promise<void> {
    await this.doctorRepository.remove(doctorEntity);
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<DoctorEntity>,
    filters?: DoctorFilterOptions,
  ): void {
    if (!filters) {
      return;
    }

    if (filters.speciality) {
      queryBuilder.andWhere('doctor.speciality = :speciality', {
        speciality: filters.speciality,
      });
    }

    if (filters.experienceYearsMin) {
      queryBuilder.andWhere('doctor.experienceYears >= :experienceYearsMin', {
        experienceYearsMin: filters.experienceYearsMin,
      });
    }

    if (filters.searchTerm) {
      queryBuilder.andWhere(
        '(doctor.name LIKE :searchTerm OR doctor.email LIKE :searchTerm)',
        {
          searchTerm: `%${filters.searchTerm}%`,
        },
      );
    }
  }
}
