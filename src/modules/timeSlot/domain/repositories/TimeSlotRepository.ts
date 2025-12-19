import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource, Between } from 'typeorm';
import { TimeSlotEntity } from '../entities/TimeSlotEntity';
import { SlotStatusEnum } from '../enums/SlotStatusEnum';

export const timeSlotRepositoryProvider = {
  provide: 'TIMESLOT_REPOSITORY',
  useFactory: (dataSource: DataSource): Repository<TimeSlotEntity> =>
    dataSource.getRepository(TimeSlotEntity),
  inject: ['DATA_SOURCE'],
};

@Injectable()
export class TimeSlotRepository {
  constructor(
    @Inject('TIMESLOT_REPOSITORY')
    private timeSlotRepository: Repository<TimeSlotEntity>,
  ) {}

  async findById(timeSlotId: number): Promise<TimeSlotEntity | null> {
    return await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.id = :timeSlotId', { timeSlotId })
      .getOne();
  }

  async save(timeSlotEntity: TimeSlotEntity): Promise<TimeSlotEntity> {
    return await this.timeSlotRepository.save(timeSlotEntity);
  }

  async saveBulk(timeSlotEntities: TimeSlotEntity[]): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository.save(timeSlotEntities);
  }

  async findByDoctorId(doctorId: number): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.doctorId = :doctorId', { doctorId })
      .orderBy('timeSlot.slotDate', 'ASC')
      .addOrderBy('timeSlot.startTime', 'ASC')
      .getMany();
  }

  async findAvailableSlotsByDoctorId(
    doctorId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeSlotEntity[]> {
    const queryBuilder = this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.doctorId = :doctorId', { doctorId })
      .andWhere('timeSlot.status = :status', {
        status: SlotStatusEnum.AVAILABLE,
      });

    if (startDate && endDate) {
      queryBuilder.andWhere('timeSlot.slotDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('timeSlot.slotDate >= :startDate', { startDate });
    }

    return await queryBuilder
      .orderBy('timeSlot.slotDate', 'ASC')
      .addOrderBy('timeSlot.startTime', 'ASC')
      .getMany();
  }

  async findByDoctorAndDate(
    doctorId: number,
    slotDate: Date,
  ): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .where('timeSlot.doctorId = :doctorId', { doctorId })
      .andWhere('timeSlot.slotDate = :slotDate', { slotDate })
      .orderBy('timeSlot.startTime', 'ASC')
      .getMany();
  }

  async updateStatus(
    timeSlotId: number,
    status: SlotStatusEnum,
  ): Promise<void> {
    await this.timeSlotRepository
      .createQueryBuilder()
      .update(TimeSlotEntity)
      .set({ status })
      .where('id = :timeSlotId', { timeSlotId })
      .execute();
  }
}
