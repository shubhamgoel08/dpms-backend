import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TimeSlotRepository } from '../../domain/repositories/TimeSlotRepository';
import { TimeSlotEntity } from '../../domain/entities/TimeSlotEntity';
import { CreateTimeSlotDto } from '../dtos/CreateTimeSlotDto';
import { CreateBulkTimeSlotsDto } from '../dtos/CreateBulkTimeSlotsDto';
import { SlotStatusEnum } from '../../domain/enums/SlotStatusEnum';

@Injectable()
export class TimeSlotService {
  constructor(private readonly timeSlotRepository: TimeSlotRepository) {}

  async createTimeSlot(
    doctorId: number,
    createTimeSlotDto: CreateTimeSlotDto,
  ): Promise<TimeSlotEntity> {
    this.validateTimeSlot(createTimeSlotDto);

    const timeSlotEntity = new TimeSlotEntity();
    timeSlotEntity.doctorId = doctorId;
    timeSlotEntity.slotDate = new Date(createTimeSlotDto.slotDate);
    timeSlotEntity.startTime = createTimeSlotDto.startTime;
    timeSlotEntity.endTime = createTimeSlotDto.endTime;
    timeSlotEntity.status = SlotStatusEnum.AVAILABLE;

    return await this.timeSlotRepository.save(timeSlotEntity);
  }

  async createBulkTimeSlots(
    doctorId: number,
    createBulkTimeSlotsDto: CreateBulkTimeSlotsDto,
  ): Promise<TimeSlotEntity[]> {
    const timeSlotEntities = createBulkTimeSlotsDto.timeSlots.map((slot) => {
      this.validateTimeSlot(slot);

      const timeSlotEntity = new TimeSlotEntity();
      timeSlotEntity.doctorId = doctorId;
      timeSlotEntity.slotDate = new Date(slot.slotDate);
      timeSlotEntity.startTime = slot.startTime;
      timeSlotEntity.endTime = slot.endTime;
      timeSlotEntity.status = SlotStatusEnum.AVAILABLE;

      return timeSlotEntity;
    });

    return await this.timeSlotRepository.saveBulk(timeSlotEntities);
  }

  async getDoctorTimeSlots(doctorId: number): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository.findByDoctorId(doctorId);
  }

  async getAvailableTimeSlots(
    doctorId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeSlotEntity[]> {
    return await this.timeSlotRepository.findAvailableSlotsByDoctorId(
      doctorId,
      startDate,
      endDate,
    );
  }

  async cancelTimeSlot(timeSlotId: number, doctorId: number): Promise<void> {
    const timeSlot = await this.timeSlotRepository.findById(timeSlotId);

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found');
    }

    if (timeSlot.doctorId !== doctorId) {
      throw new BadRequestException(
        'You are not authorized to cancel this time slot',
      );
    }

    if (timeSlot.status === SlotStatusEnum.BOOKED) {
      throw new BadRequestException(
        'Cannot cancel a booked time slot. Please cancel the appointment first.',
      );
    }

    await this.timeSlotRepository.updateStatus(
      timeSlotId,
      SlotStatusEnum.CANCELLED,
    );
  }

  private validateTimeSlot(createTimeSlotDto: CreateTimeSlotDto): void {
    const slotDate = new Date(createTimeSlotDto.slotDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (slotDate < today) {
      throw new BadRequestException('Cannot create time slots for past dates');
    }

    const [startHour, startMinute] = createTimeSlotDto.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = createTimeSlotDto.endTime
      .split(':')
      .map(Number);

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (startTimeInMinutes >= endTimeInMinutes) {
      throw new BadRequestException('End time must be after start time');
    }
  }
}
