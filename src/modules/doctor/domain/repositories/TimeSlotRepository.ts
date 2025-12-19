import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {TimeSlotEntity} from '../entities/TimeSlotEntity'
import {DayOfWeekEnum} from '../enums/DayOfWeekEnum'

@Injectable()
export class TimeSlotRepository {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
  ) {}

  async findByDoctorId(doctorId: number): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.doctorId = :doctorId', {doctorId})
      .andWhere('timeSlot.isAvailable = :isAvailable', {isAvailable: true})
      .orderBy('timeSlot.dayOfWeek', 'ASC')
      .addOrderBy('timeSlot.startTime', 'ASC')
      .getMany()
  }

  async findByDoctorIdAndDay(
    doctorId: number,
    dayOfWeek: DayOfWeekEnum,
  ): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.doctorId = :doctorId', {doctorId})
      .andWhere('timeSlot.dayOfWeek = :dayOfWeek', {dayOfWeek})
      .andWhere('timeSlot.isAvailable = :isAvailable', {isAvailable: true})
      .orderBy('timeSlot.startTime', 'ASC')
      .getMany()
  }

  async findById(timeSlotId: number): Promise<TimeSlotEntity | null> {
    return await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.id = :timeSlotId', {timeSlotId})
      .getOne()
  }

  async save(timeSlot: TimeSlotEntity): Promise<TimeSlotEntity> {
    return await this.timeSlotRepository.save(timeSlot)
  }
}

