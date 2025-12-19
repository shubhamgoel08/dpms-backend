import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'
import {GenderEnum} from '../../domain/enums/GenderEnum'

export class CreatePatientDto {
  @ApiProperty({example: 'patient@example.com', description: 'Patient email address'})
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({example: 'Password123!', description: 'Password (min 8 characters)', minLength: 8})
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string

  @ApiProperty({example: 'John', description: 'Patient first name'})
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string

  @ApiProperty({example: 'Doe', description: 'Patient last name'})
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName: string

  @ApiPropertyOptional({example: '+1234567890', description: 'Phone number'})
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @ApiPropertyOptional({example: '1990-01-15', description: 'Date of birth (YYYY-MM-DD)'})
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiPropertyOptional({enum: GenderEnum, description: 'Gender'})
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum

  @ApiPropertyOptional({example: '123 Main Street', description: 'Address'})
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional({example: 'New York', description: 'City'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @ApiPropertyOptional({example: 'NY', description: 'State'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string

  @ApiPropertyOptional({example: '10001', description: 'Zip code'})
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string
}
