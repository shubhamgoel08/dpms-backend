import {Injectable} from '@nestjs/common'
import {IFieldValidationError} from '../validation/IFieldValidationError'

export interface IApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: IFieldValidationError[]
}

@Injectable()
export class ResponseService {
  success<T>(data: T, message?: string): IApiResponse<T> {
    return {
      success: true,
      data,
      message,
    }
  }

  error(message: string): IApiResponse<null> {
    return {
      success: false,
      message,
    }
  }

  validationError(
    errors: IFieldValidationError[],
    message = 'Validation failed',
  ): IApiResponse<null> {
    return {
      success: false,
      message,
      errors,
    }
  }

  serverError(message = 'Internal server error'): IApiResponse<null> {
    return {
      success: false,
      message,
    }
  }
}

