import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import {HttpAdapterHost} from '@nestjs/core'
import {ResponseService} from '../response/ResponseService'
import {ErrorLogService} from '../services/ErrorLogService'
import {ValidationException} from '../validation/ValidationException'
import {IFieldValidationError} from '../validation/IFieldValidationError'
import {Request} from 'express'

interface IUserRequest extends Request {
  user?: {
    userId?: number
    email?: string
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name)

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly responseService: ResponseService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const http = host.switchToHttp()
    const request = http.getRequest<IUserRequest>()

    try {
      const user = request.user

      let errorMessage: string
      let httpStatus: number
      let validationErrors: IFieldValidationError[] | undefined

      if (exception instanceof ValidationException) {
        errorMessage = 'Validation failed'
        httpStatus = exception.getStatus()
        validationErrors = exception.getResponse() as IFieldValidationError[]
      } else if (exception instanceof HttpException) {
        errorMessage = exception.message
        httpStatus = exception.getStatus()

        if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
          this.logger.error((exception as HttpException).stack)
          this.errorLogService.logToDb(exception, user)
        }
      } else {
        errorMessage = 'Internal server error'
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR

        this.logger.error(exception)
        this.errorLogService.logToDb(exception, user)
      }

      let errorResponse
      if (validationErrors) {
        errorResponse = this.responseService.validationError(validationErrors, errorMessage)
      } else {
        errorResponse = this.responseService.serverError(errorMessage)
      }

      this.httpAdapterHost.httpAdapter.reply(http.getResponse(), errorResponse, httpStatus)
    } catch (error) {
      this.logger.error('Error occurred while handling application exception', error)
      this.httpAdapterHost.httpAdapter.reply(
        http.getResponse(),
        this.responseService.serverError('Internal server error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}

