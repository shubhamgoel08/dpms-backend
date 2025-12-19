import {IsOptional, IsEnum, IsString, IsNumber, Min, Max} from 'class-validator'
import {Type} from 'class-transformer'
import {ApiPropertyOptional} from '@nestjs/swagger'
import {SpecialtyEnum} from '../../domain/enums/SpecialtyEnum'
import {DayOfWeekEnum} from '../../domain/enums/DayOfWeekEnum'

export class DoctorSearchDto {
  @ApiPropertyOptional({enum: SpecialtyEnum, description: 'Filter by specialty'})
  @IsOptional()
  @IsEnum(SpecialtyEnum)
  specialty?: SpecialtyEnum

  @ApiPropertyOptional({example: 'New York', description: 'Filter by city'})
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({example: 'NY', description: 'Filter by state'})
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional({example: 5, description: 'Minimum years of experience'})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience?: number

  @ApiPropertyOptional({example: 200, description: 'Maximum consultation fee'})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxConsultationFee?: number

  @ApiPropertyOptional({example: 4.0, description: 'Minimum rating (0-5)'})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number

  @ApiPropertyOptional({example: 'Smith', description: 'Search by doctor name'})
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({enum: DayOfWeekEnum, description: 'Filter by available day'})
  @IsOptional()
  @IsEnum(DayOfWeekEnum)
  dayOfWeek?: DayOfWeekEnum

  @ApiPropertyOptional({example: '10:00', description: 'Filter by available time slot'})
  @IsOptional()
  @IsString()
  timeSlot?: string

  @ApiPropertyOptional({example: 1, description: 'Page number', default: 1})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({example: 10, description: 'Items per page', default: 10})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10
}
