import {Column, BeforeInsert, BeforeUpdate} from 'typeorm'

export abstract class BaseEntity {
  @Column({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    nullable: false,
  })
  updatedAt: Date

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date()
  }
}
