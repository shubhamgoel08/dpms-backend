import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/BaseEntity';
import { DoctorEntity } from '../../../doctor/domain/entities/DoctorEntity';
import { TimeSlotEntity } from '../../../timeSlot/domain/entities/TimeSlotEntity';
import { AppointmentStatusEnum } from '../enums/AppointmentStatusEnum';

@Entity({ name: 'appointments' })
export class AppointmentEntity extends BaseEntity {
  @Column({
    name: 'patient_id',
    type: 'int',
    nullable: false,
  })
  patientId: number;

  @Column({
    name: 'doctor_id',
    type: 'int',
    nullable: false,
  })
  doctorId: number;

  @ManyToOne(() => DoctorEntity)
  @JoinColumn({ name: 'doctor_id' })
  doctor: DoctorEntity;

  @Column({
    name: 'time_slot_id',
    type: 'int',
    nullable: false,
  })
  timeSlotId: number;

  @OneToOne(() => TimeSlotEntity)
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AppointmentStatusEnum,
    default: AppointmentStatusEnum.SCHEDULED,
    nullable: false,
  })
  status: AppointmentStatusEnum;

  @Column({
    name: 'booked_at',
    type: 'timestamp',
    nullable: false,
  })
  bookedAt: Date;
}
