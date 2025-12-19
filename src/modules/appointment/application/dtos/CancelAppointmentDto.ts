import {IsString, IsOptional} from 'class-validator'
import {ApiPropertyOptional} from '@nestjs/swagger'

export class CancelAppointmentDto {
  @ApiPropertyOptional({example: 'Schedule conflict', description: 'Reason for cancellation'})
  @IsOptional()
  @IsString()
  cancellationReason?: string
}
