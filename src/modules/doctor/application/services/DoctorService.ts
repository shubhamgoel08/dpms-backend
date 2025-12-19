import {Injectable, NotFoundException} from '@nestjs/common'

import {DoctorRepository, IDoctorSearchFilters} from '../../domain/repositories/DoctorRepository'
import {TimeSlotRepository} from '../../domain/repositories/TimeSlotRepository'
import {DoctorSearchDto} from '../dtos/DoctorSearchDto'
import {DoctorResponseDto, DoctorListResponseDto} from '../dtos/DoctorResponseDto'
import {TimeSlotResponseDto} from '../dtos/TimeSlotResponseDto'
import {SpecialtyEnum} from '../../domain/enums/SpecialtyEnum'
import {DayOfWeekEnum} from '../../domain/enums/DayOfWeekEnum'

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
  ) {}

  async search(searchDto: DoctorSearchDto): Promise<DoctorListResponseDto> {
    const filters = this.buildSearchFilters(searchDto)
    const pagination = {
      page: searchDto.page ?? 1,
      limit: searchDto.limit ?? 10,
    }

    const result = await this.doctorRepository.search(filters, pagination)

    return DoctorListResponseDto.create(
      result.data,
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    )
  }

  async findById(doctorId: number): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepository.findById(doctorId)

    if (!doctor) {
      throw new NotFoundException('Doctor not found')
    }

    return DoctorResponseDto.fromEntity(doctor)
  }

  async findAll(): Promise<DoctorResponseDto[]> {
    const doctors = await this.doctorRepository.findAllActive()
    return doctors.map(DoctorResponseDto.fromEntity)
  }

  async findBySpecialty(specialty: SpecialtyEnum): Promise<DoctorResponseDto[]> {
    const doctors = await this.doctorRepository.findBySpecialty(specialty)
    return doctors.map(DoctorResponseDto.fromEntity)
  }

  async getTimeSlots(doctorId: number): Promise<TimeSlotResponseDto[]> {
    await this.ensureDoctorExists(doctorId)

    const timeSlots = await this.timeSlotRepository.findByDoctorId(doctorId)
    return timeSlots.map(TimeSlotResponseDto.fromEntity)
  }

  async getTimeSlotsByDay(
    doctorId: number,
    dayOfWeek: DayOfWeekEnum,
  ): Promise<TimeSlotResponseDto[]> {
    await this.ensureDoctorExists(doctorId)

    const timeSlots = await this.timeSlotRepository.findByDoctorIdAndDay(doctorId, dayOfWeek)
    return timeSlots.map(TimeSlotResponseDto.fromEntity)
  }

  async getSpecialties(): Promise<string[]> {
    return Object.values(SpecialtyEnum)
  }

  async getAvailableSpecialties(): Promise<string[]> {
    return this.doctorRepository.getSpecialties()
  }

  private async ensureDoctorExists(doctorId: number): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId)

    if (!doctor) {
      throw new NotFoundException('Doctor not found')
    }
  }

  private buildSearchFilters(dto: DoctorSearchDto): IDoctorSearchFilters {
    return {
      specialty: dto.specialty,
      city: dto.city,
      state: dto.state,
      minExperience: dto.minExperience,
      maxConsultationFee: dto.maxConsultationFee,
      minRating: dto.minRating,
      name: dto.name,
      dayOfWeek: dto.dayOfWeek,
      timeSlot: dto.timeSlot,
    }
  }
}
