import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity({ name: 'error_logs' })
export class ErrorLogEntity extends BaseEntity {
  @Column({
    name: 'error_message',
    type: 'text',
    nullable: false,
  })
  errorMessage: string;

  @Column({
    name: 'error_stack',
    type: 'text',
    nullable: true,
  })
  errorStack: string | null;

  @Column({
    name: 'request_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  requestPath: string | null;

  @Column({
    name: 'request_method',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  requestMethod: string | null;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
  })
  userId: number | null;

  @Column({
    name: 'user_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  userEmail: string | null;

  @Column({
    name: 'http_status',
    type: 'int',
    nullable: true,
  })
  httpStatus: number | null;

  @Column({
    name: 'error_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  errorType: string | null;

  static create(
    errorMessage: string,
    errorStack: string | null,
    requestPath: string | null,
    requestMethod: string | null,
    userId: number | null,
    userEmail: string | null,
    httpStatus: number | null,
    errorType: string | null,
  ): ErrorLogEntity {
    const errorLog = new ErrorLogEntity();
    errorLog.errorMessage = errorMessage;
    errorLog.errorStack = errorStack;
    errorLog.requestPath = requestPath;
    errorLog.requestMethod = requestMethod;
    errorLog.userId = userId;
    errorLog.userEmail = userEmail;
    errorLog.httpStatus = httpStatus;
    errorLog.errorType = errorType;
    return errorLog;
  }
}
