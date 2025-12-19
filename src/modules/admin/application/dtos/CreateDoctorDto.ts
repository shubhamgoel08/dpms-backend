import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SpecialityEnum } from '../../../doctor/domain/enums/SpecialityEnum';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Doctor email address',
    example: 'doctor@hospital.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Doctor password (minimum 8 characters)',
    example: 'Doctor@123',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Doctor full name',
    example: 'Dr. John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Doctor speciality',
    enum: SpecialityEnum,
    example: SpecialityEnum.CARDIOLOGY,
  })
  @IsNotEmpty()
  @IsEnum(SpecialityEnum)
  speciality: SpecialityEnum;

  @ApiProperty({
    description: 'Doctor phone number',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 10,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  experienceYears: number;
}
