import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository, SelectQueryBuilder} from 'typeorm'

import {DoctorEntity} from '../entities/DoctorEntity'
import {DoctorStatusEnum} from '../enums/DoctorStatusEnum'
import {SpecialtyEnum} from '../enums/SpecialtyEnum'

export interface IDoctorSearchFilters {
  specialty?: SpecialtyEnum
  city?: string
  state?: string
  minExperience?: number
  maxConsultationFee?: number
  minRating?: number
  name?: string
  dayOfWeek?: string
  timeSlot?: string
}

export interface IPaginationOptions {
  page: number
  limit: number
}

export interface IPaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class DoctorRepository {
  constructor(
    @InjectRepository(DoctorEntity)
    private readonly repository: Repository<DoctorEntity>,
  ) {}

  async findById(doctorId: number): Promise<DoctorEntity | null> {
    return this.repository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.timeSlots', 'timeSlots')
      .where('doctor.id = :doctorId', {doctorId})
      .andWhere('doctor.status = :status', {status: DoctorStatusEnum.ACTIVE})
      .getOne()
  }

  async findByEmail(email: string): Promise<DoctorEntity | null> {
    return this.repository
      .createQueryBuilder('doctor')
      .where('doctor.email = :email', {email})
      .getOne()
  }

  async search(
    filters: IDoctorSearchFilters,
    pagination: IPaginationOptions,
  ): Promise<IPaginatedResult<DoctorEntity>> {
    const queryBuilder = this.buildSearchQuery(filters)

    const total = await queryBuilder.getCount()
    const skip = (pagination.page - 1) * pagination.limit

    const data = await queryBuilder
      .skip(skip)
      .take(pagination.limit)
      .orderBy('doctor.rating', 'DESC')
      .addOrderBy('doctor.totalReviews', 'DESC')
      .getMany()

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }
  }

  async findAllActive(): Promise<DoctorEntity[]> {
    return this.repository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.timeSlots', 'timeSlots')
      .where('doctor.status = :status', {status: DoctorStatusEnum.ACTIVE})
      .orderBy('doctor.rating', 'DESC')
      .getMany()
  }

  async findBySpecialty(specialty: SpecialtyEnum): Promise<DoctorEntity[]> {
    return this.repository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.timeSlots', 'timeSlots')
      .where('doctor.specialty = :specialty', {specialty})
      .andWhere('doctor.status = :status', {status: DoctorStatusEnum.ACTIVE})
      .orderBy('doctor.rating', 'DESC')
      .getMany()
  }

  async getSpecialties(): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder('doctor')
      .select('DISTINCT doctor.specialty', 'specialty')
      .where('doctor.status = :status', {status: DoctorStatusEnum.ACTIVE})
      .getRawMany()

    return result.map(row => row.specialty)
  }

  private buildSearchQuery(filters: IDoctorSearchFilters): SelectQueryBuilder<DoctorEntity> {
    const qb = this.repository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.timeSlots', 'timeSlots')
      .where('doctor.status = :status', {status: DoctorStatusEnum.ACTIVE})

    if (filters.specialty) {
      qb.andWhere('doctor.specialty = :specialty', {specialty: filters.specialty})
    }

    if (filters.city) {
      qb.andWhere('doctor.city LIKE :city', {city: `%${filters.city}%`})
    }

    if (filters.state) {
      qb.andWhere('doctor.state LIKE :state', {state: `%${filters.state}%`})
    }

    if (filters.minExperience !== undefined) {
      qb.andWhere('doctor.experienceYears >= :minExperience', {
        minExperience: filters.minExperience,
      })
    }

    if (filters.maxConsultationFee !== undefined) {
      qb.andWhere('doctor.consultationFee <= :maxConsultationFee', {
        maxConsultationFee: filters.maxConsultationFee,
      })
    }

    if (filters.minRating !== undefined) {
      qb.andWhere('doctor.rating >= :minRating', {minRating: filters.minRating})
    }

    if (filters.name) {
      qb.andWhere('(doctor.firstName LIKE :name OR doctor.lastName LIKE :name)', {
        name: `%${filters.name}%`,
      })
    }

    if (filters.dayOfWeek) {
      qb.andWhere('timeSlots.dayOfWeek = :dayOfWeek', {dayOfWeek: filters.dayOfWeek})
      qb.andWhere('timeSlots.isAvailable = :isAvailable', {isAvailable: true})
    }

    if (filters.timeSlot) {
      qb.andWhere('timeSlots.startTime <= :timeSlot', {timeSlot: filters.timeSlot})
      qb.andWhere('timeSlots.endTime >= :timeSlot', {timeSlot: filters.timeSlot})
    }

    return qb
  }
}
