import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'
import {BaseEntity} from '@modules/shared/entities/BaseEntity'
import {PatientStatusEnum} from '../enums/PatientStatusEnum'
import {GenderEnum} from '../enums/GenderEnum'

@Entity({name: 'patient'})
export class PatientEntity extends BaseEntity {
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
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date | null

  @Column({
    name: 'gender',
    type: 'enum',
    enum: GenderEnum,
    nullable: true,
  })
  gender: GenderEnum | null

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address: string | null

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
    name: 'zip_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  zipCode: string | null

  @Column({
    name: 'status',
    type: 'enum',
    enum: PatientStatusEnum,
    default: PatientStatusEnum.ACTIVE,
    nullable: false,
  })
  status: PatientStatusEnum

  @Column({
    name: 'profile_picture_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profilePictureUrl: string | null
}

