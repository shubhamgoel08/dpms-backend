import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm'
import {BaseEntity} from '@modules/shared/entities/BaseEntity'
import {AppointmentStatusEnum} from '../enums/AppointmentStatusEnum'
import {PatientEntity} from '@modules/patient/domain/entities/PatientEntity'
import {DoctorEntity} from '@modules/doctor/domain/entities/DoctorEntity'

@Entity({name: 'appointment'})
export class AppointmentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'patient_id',
    type: 'int',
    nullable: false,
  })
  patientId: number

  @Column({
    name: 'doctor_id',
    type: 'int',
    nullable: false,
  })
  doctorId: number

  @Column({
    name: 'appointment_date',
    type: 'date',
    nullable: false,
  })
  appointmentDate: Date

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
    name: 'status',
    type: 'enum',
    enum: AppointmentStatusEnum,
    default: AppointmentStatusEnum.CONFIRMED,
    nullable: false,
  })
  status: AppointmentStatusEnum

  @Column({
    name: 'reason',
    type: 'text',
    nullable: true,
  })
  reason: string | null

  @Column({
    name: 'notes',
    type: 'text',
    nullable: true,
  })
  notes: string | null

  @Column({
    name: 'consultation_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  consultationFee: number

  @Column({
    name: 'cancellation_reason',
    type: 'text',
    nullable: true,
  })
  cancellationReason: string | null

  @Column({
    name: 'cancelled_at',
    type: 'datetime',
    nullable: true,
  })
  cancelledAt: Date | null

  @ManyToOne(() => PatientEntity)
  @JoinColumn({name: 'patient_id'})
  patient: PatientEntity

  @ManyToOne(() => DoctorEntity)
  @JoinColumn({name: 'doctor_id'})
  doctor: DoctorEntity
}

