import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/BaseEntity';
import { AdminEntity } from '../../../admin/domain/entities/AdminEntity';
import { SpecialityEnum } from '../enums/SpecialityEnum';
import { TimeSlotEntity } from '../../../timeSlot/domain/entities/TimeSlotEntity';

@Entity({ name: 'doctors' })
export class DoctorEntity extends BaseEntity {
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordHash: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'speciality',
    type: 'enum',
    enum: SpecialityEnum,
    nullable: false,
  })
  speciality: SpecialityEnum;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  phone: string;

  @Column({
    name: 'experience_years',
    type: 'int',
    nullable: false,
    default: 0,
  })
  experienceYears: number;

  @Column({
    name: 'created_by_admin_id',
    type: 'int',
    nullable: false,
  })
  createdByAdminId: number;

  @ManyToOne(() => AdminEntity)
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: AdminEntity;

  @OneToMany(() => TimeSlotEntity, (timeSlot) => timeSlot.doctor)
  timeSlots: TimeSlotEntity[];
}
