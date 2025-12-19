import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  patientId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  doctorId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  timeSlotId: number;
}
