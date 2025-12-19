import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'

@Entity({name: 'error_log'})
export class ErrorLogEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string

  @Column({
    name: 'message',
    type: 'text',
    nullable: false,
  })
  message: string

  @Column({
    name: 'stack',
    type: 'text',
    nullable: true,
  })
  stack: string | null

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
  })
  userId: number | null

  @Column({
    name: 'user_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  userEmail: string | null

  @Column({
    name: 'timestamp',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date
}
