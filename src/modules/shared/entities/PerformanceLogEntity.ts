import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'
import {IQueryInfo} from '../performanceLog/PerformanceLogStore'

@Entity({name: 'performance_log'})
export class PerformanceLogEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'path',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  path: string

  @Column({
    name: 'method',
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  method: string

  @Column({
    name: 'status',
    type: 'int',
    nullable: false,
  })
  status: number

  @Column({
    name: 'request_duration',
    type: 'int',
    nullable: false,
  })
  requestDuration: number

  @Column({
    name: 'query_count',
    type: 'int',
    nullable: false,
  })
  queryCount: number

  @Column({
    name: 'queries',
    type: 'json',
    nullable: true,
  })
  queries: IQueryInfo[]

  @Column({
    name: 'payload_size',
    type: 'int',
    nullable: false,
  })
  payloadSize: number

  @Column({
    name: 'timestamp',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date

  static create(
    path: string,
    method: string,
    status: number,
    requestDuration: number,
    queryCount: number,
    queries: IQueryInfo[],
    payloadSize: number,
  ): PerformanceLogEntity {
    const entity = new PerformanceLogEntity()
    entity.path = path
    entity.method = method
    entity.status = status
    entity.requestDuration = requestDuration
    entity.queryCount = queryCount
    entity.queries = queries
    entity.payloadSize = payloadSize
    entity.timestamp = new Date()
    return entity
  }
}
