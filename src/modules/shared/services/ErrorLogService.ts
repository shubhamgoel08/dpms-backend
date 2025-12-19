import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {ErrorLogEntity} from '../entities/ErrorLogEntity'

export interface IUserContext {
  userId?: number
  email?: string
}

@Injectable()
export class ErrorLogService {
  private readonly logger = new Logger(ErrorLogService.name)

  constructor(
    @InjectRepository(ErrorLogEntity)
    private readonly errorLogRepository: Repository<ErrorLogEntity>,
  ) {}

  async logToDb(exception: unknown, user?: IUserContext): Promise<void> {
    try {
      const errorLog = new ErrorLogEntity()

      if (exception instanceof Error) {
        errorLog.message = exception.message
        errorLog.stack = exception.stack || null
        errorLog.name = exception.name
      } else {
        errorLog.message = String(exception)
        errorLog.stack = null
        errorLog.name = 'UnknownError'
      }

      errorLog.userId = user?.userId || null
      errorLog.userEmail = user?.email || null
      errorLog.timestamp = new Date()

      await this.errorLogRepository.save(errorLog)
    } catch (error) {
      this.logger.error('Failed to log error to database', error)
    }
  }
}

