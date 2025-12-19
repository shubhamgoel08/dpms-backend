import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/BaseEntity';
import { DoctorEntity } from '../../../doctor/domain/entities/DoctorEntity';
import { SlotStatusEnum } from '../enums/SlotStatusEnum';

@Entity({ name: 'time_slots' })
export class TimeSlotEntity extends BaseEntity {
  @Column({
    name: 'doctor_id',
    type: 'int',
    nullable: false,
  })
  doctorId: number;

  @ManyToOne(() => DoctorEntity, (doctor) => doctor.timeSlots)
  @JoinColumn({ name: 'doctor_id' })
  doctor: DoctorEntity;

  @Column({
    name: 'slot_date',
    type: 'date',
    nullable: false,
  })
  slotDate: Date;

  @Column({
    name: 'start_time',
    type: 'time',
    nullable: false,
  })
  startTime: string;

  @Column({
    name: 'end_time',
    type: 'time',
    nullable: false,
  })
  endTime: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SlotStatusEnum,
    default: SlotStatusEnum.AVAILABLE,
    nullable: false,
  })
  status: SlotStatusEnum;
}
