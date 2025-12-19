import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/BaseEntity';

@Entity({ name: 'admins' })
export class AdminEntity extends BaseEntity {
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
}
