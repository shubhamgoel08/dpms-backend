import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import {BaseEntity} from '@modules/shared/entities/BaseEntity'
import {DoctorStatusEnum} from '../enums/DoctorStatusEnum'
import {SpecialtyEnum} from '../enums/SpecialtyEnum'
import {TimeSlotEntity} from './TimeSlotEntity'

@Entity({name: 'doctor'})
export class DoctorEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  firstName: string

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  lastName: string

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null

  @Column({
    name: 'specialty',
    type: 'enum',
    enum: SpecialtyEnum,
    nullable: false,
  })
  specialty: SpecialtyEnum

  @Column({
    name: 'qualification',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  qualification: string

  @Column({
    name: 'experience_years',
    type: 'int',
    nullable: false,
    default: 0,
  })
  experienceYears: number

  @Column({
    name: 'consultation_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  consultationFee: number

  @Column({
    name: 'bio',
    type: 'text',
    nullable: true,
  })
  bio: string | null

  @Column({
    name: 'hospital_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  hospitalName: string | null

  @Column({
    name: 'hospital_address',
    type: 'text',
    nullable: true,
  })
  hospitalAddress: string | null

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city: string | null

  @Column({
    name: 'state',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  state: string | null

  @Column({
    name: 'status',
    type: 'enum',
    enum: DoctorStatusEnum,
    default: DoctorStatusEnum.ACTIVE,
    nullable: false,
  })
  status: DoctorStatusEnum

  @Column({
    name: 'profile_picture_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profilePictureUrl: string | null

  @Column({
    name: 'rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    default: 0,
  })
  rating: number | null

  @Column({
    name: 'total_reviews',
    type: 'int',
    nullable: false,
    default: 0,
  })
  totalReviews: number

  @OneToMany(() => TimeSlotEntity, timeSlot => timeSlot.doctor)
  timeSlots: TimeSlotEntity[]
}

