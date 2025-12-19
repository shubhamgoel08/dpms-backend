import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm'
import {BaseEntity} from '@modules/shared/entities/BaseEntity'
import {DayOfWeekEnum} from '../enums/DayOfWeekEnum'
import {DoctorEntity} from './DoctorEntity'

@Entity({name: 'time_slot'})
export class TimeSlotEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'doctor_id',
    type: 'int',
    nullable: false,
  })
  doctorId: number

  @Column({
    name: 'day_of_week',
    type: 'enum',
    enum: DayOfWeekEnum,
    nullable: false,
  })
  dayOfWeek: DayOfWeekEnum

  @Column({
    name: 'start_time',
    type: 'time',
    nullable: false,
  })
  startTime: string

  @Column({
    name: 'end_time',
    type: 'time',
    nullable: false,
  })
  endTime: string

  @Column({
    name: 'slot_duration_minutes',
    type: 'int',
    nullable: false,
    default: 30,
  })
  slotDurationMinutes: number

  @Column({
    name: 'is_available',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isAvailable: boolean

  @ManyToOne(() => DoctorEntity, doctor => doctor.timeSlots)
  @JoinColumn({name: 'doctor_id'})
  doctor: DoctorEntity
}

