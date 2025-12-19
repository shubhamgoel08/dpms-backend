import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeSlotDto {
  @ApiProperty({
    description: 'Date of the time slot (YYYY-MM-DD)',
    example: '2025-12-25',
  })
  @IsNotEmpty()
  @IsDateString()
  slotDate: string;

  @ApiProperty({
    description: 'Start time of the slot (HH:MM format)',
    example: '09:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the slot (HH:MM format)',
    example: '09:30',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;
}
