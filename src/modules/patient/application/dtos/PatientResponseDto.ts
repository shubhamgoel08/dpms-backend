import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'

import {PatientEntity} from '../../domain/entities/PatientEntity'
import {GenderEnum} from '../../domain/enums/GenderEnum'
import {PatientStatusEnum} from '../../domain/enums/PatientStatusEnum'

export class PatientResponseDto {
  @ApiProperty({example: 1})
  id: number

  @ApiProperty({example: 'patient@example.com'})
  email: string

  @ApiProperty({example: 'John'})
  firstName: string

  @ApiProperty({example: 'Doe'})
  lastName: string

  @ApiPropertyOptional({example: '+1234567890'})
  phone: string | null

  @ApiPropertyOptional({example: '1990-01-15'})
  dateOfBirth: Date | null

  @ApiPropertyOptional({enum: GenderEnum})
  gender: GenderEnum | null

  @ApiPropertyOptional({example: '123 Main Street'})
  address: string | null

  @ApiPropertyOptional({example: 'New York'})
  city: string | null

  @ApiPropertyOptional({example: 'NY'})
  state: string | null

  @ApiPropertyOptional({example: '10001'})
  zipCode: string | null

  @ApiProperty({enum: PatientStatusEnum})
  status: PatientStatusEnum

  @ApiPropertyOptional({example: 'https://example.com/photo.jpg'})
  profilePictureUrl: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  static fromEntity(entity: PatientEntity): PatientResponseDto {
    const dto = new PatientResponseDto()

    dto.id = entity.id
    dto.email = entity.email
    dto.firstName = entity.firstName
    dto.lastName = entity.lastName
    dto.phone = entity.phone
    dto.dateOfBirth = entity.dateOfBirth
    dto.gender = entity.gender
    dto.address = entity.address
    dto.city = entity.city
    dto.state = entity.state
    dto.zipCode = entity.zipCode
    dto.status = entity.status
    dto.profilePictureUrl = entity.profilePictureUrl
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt

    return dto
  }
}
