import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTimeSlotDto } from './CreateTimeSlotDto';

export class CreateBulkTimeSlotsDto {
  @ApiProperty({
    description: 'Array of time slots to create',
    type: [CreateTimeSlotDto],
    example: [
      {
        slotDate: '2025-12-25',
        startTime: '09:00',
        endTime: '09:30',
      },
      {
        slotDate: '2025-12-25',
        startTime: '09:30',
        endTime: '10:00',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeSlotDto)
  timeSlots: CreateTimeSlotDto[];
}
