import {IsString, MaxLength, IsOptional, IsEnum, IsDateString} from 'class-validator'
import {ApiPropertyOptional} from '@nestjs/swagger'
import {GenderEnum} from '../../domain/enums/GenderEnum'

export class UpdatePatientDto {
  @ApiPropertyOptional({example: 'John', description: 'Patient first name'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string

  @ApiPropertyOptional({example: 'Doe', description: 'Patient last name'})
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string

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

  @ApiPropertyOptional({example: 'https://example.com/photo.jpg', description: 'Profile picture URL'})
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePictureUrl?: string
}
