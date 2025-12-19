import {IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, Matches} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'

export class CreateAppointmentDto {
  @ApiProperty({example: 1, description: 'Doctor ID'})
  @IsNotEmpty()
  @IsNumber()
  doctorId: number

  @ApiProperty({example: '2024-12-25', description: 'Appointment date (YYYY-MM-DD)'})
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string

  @ApiProperty({example: '10:00', description: 'Start time (HH:MM format)'})
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string

  @ApiProperty({example: '10:30', description: 'End time (HH:MM format)'})
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string

  @ApiPropertyOptional({example: 'General checkup', description: 'Reason for appointment'})
  @IsOptional()
  @IsString()
  reason?: string

  @ApiPropertyOptional({example: 'First time visit', description: 'Additional notes'})
  @IsOptional()
  @IsString()
  notes?: string
}
