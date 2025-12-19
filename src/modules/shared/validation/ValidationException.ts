import {HttpException, HttpStatus} from '@nestjs/common'
import {IFieldValidationError} from './IFieldValidationError'

export class ValidationException extends HttpException {
  constructor(errors: IFieldValidationError[]) {
    super(errors, HttpStatus.BAD_REQUEST)
  }
}

