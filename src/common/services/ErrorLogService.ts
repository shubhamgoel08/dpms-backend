import { Injectable, Logger } from '@nestjs/common';
import { ErrorLogRepository } from '../repositories/ErrorLogRepository';
import { ErrorLogEntity } from '../entities/ErrorLogEntity';

export interface IUser {
  id?: number;
  email?: string;
}

@Injectable()
export class ErrorLogService {
  private logger = new Logger(ErrorLogService.name);

  constructor(private readonly errorLogRepository: ErrorLogRepository) {}

  async logToDb(
    exception: unknown,
    user?: IUser,
    requestPath?: string,
    requestMethod?: string,
  ): Promise<void> {
    try {
      const errorMessage = this.getErrorMessage(exception);
      const errorStack = this.getErrorStack(exception);
      const errorType = this.getErrorType(exception);
      const httpStatus = this.getHttpStatus(exception);

      const errorLogEntity = ErrorLogEntity.create(
        errorMessage,
        errorStack,
        requestPath || null,
        requestMethod || null,
        user?.id || null,
        user?.email || null,
        httpStatus,
        errorType,
      );

      await this.errorLogRepository.save(errorLogEntity);
    } catch (error) {
      // Fallback: if logging to DB fails, log to console
      this.logger.error(
        'Failed to log error to database',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }
    return String(exception);
  }

  private getErrorStack(exception: unknown): string | null {
    if (exception instanceof Error) {
      return exception.stack || null;
    }
    return null;
  }

  private getErrorType(exception: unknown): string | null {
    if (exception instanceof Error) {
      return exception.constructor.name;
    }
    return typeof exception;
  }

  private getHttpStatus(exception: unknown): number | null {
    if (exception && typeof exception === 'object' && 'getStatus' in exception) {
      return (exception as any).getStatus();
    }
    return null;
  }

  async getRecentErrors(limit: number = 100): Promise<ErrorLogEntity[]> {
    return await this.errorLogRepository.findAll(limit);
  }

  async getErrorById(id: number): Promise<ErrorLogEntity | null> {
    return await this.errorLogRepository.findById(id);
  }
}
