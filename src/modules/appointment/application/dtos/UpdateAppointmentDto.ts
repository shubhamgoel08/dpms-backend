import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatusEnum } from '../../domain/enums/AppointmentStatusEnum';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ enum: AppointmentStatusEnum })
  @IsOptional()
  @IsEnum(AppointmentStatusEnum)
  status?: AppointmentStatusEnum;
}
