import {ApiProperty} from '@nestjs/swagger'

import {TimeSlotEntity} from '../../domain/entities/TimeSlotEntity'
import {DayOfWeekEnum} from '../../domain/enums/DayOfWeekEnum'

export class TimeSlotResponseDto {
  @ApiProperty({example: 1})
  id: number

  @ApiProperty({example: 1})
  doctorId: number

  @ApiProperty({enum: DayOfWeekEnum, example: DayOfWeekEnum.MONDAY})
  dayOfWeek: DayOfWeekEnum

  @ApiProperty({example: '09:00'})
  startTime: string

  @ApiProperty({example: '12:00'})
  endTime: string

  @ApiProperty({example: 30})
  slotDurationMinutes: number

  @ApiProperty({example: true})
  isAvailable: boolean

  static fromEntity(entity: TimeSlotEntity): TimeSlotResponseDto {
    const dto = new TimeSlotResponseDto()

    dto.id = entity.id
    dto.doctorId = entity.doctorId
    dto.dayOfWeek = entity.dayOfWeek
    dto.startTime = entity.startTime
    dto.endTime = entity.endTime
    dto.slotDurationMinutes = entity.slotDurationMinutes
    dto.isAvailable = entity.isAvailable

    return dto
  }
}
