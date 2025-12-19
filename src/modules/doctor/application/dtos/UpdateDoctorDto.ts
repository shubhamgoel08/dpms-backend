import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SpecialityEnum } from '../../domain/enums/SpecialityEnum';

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'Dr. John Smith' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: SpecialityEnum })
  @IsOptional()
  @IsEnum(SpecialityEnum)
  speciality?: SpecialityEnum;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;
}
