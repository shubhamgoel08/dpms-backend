import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'

import {DoctorEntity} from '../../domain/entities/DoctorEntity'
import {SpecialtyEnum} from '../../domain/enums/SpecialtyEnum'
import {DoctorStatusEnum} from '../../domain/enums/DoctorStatusEnum'
import {TimeSlotResponseDto} from './TimeSlotResponseDto'

export class DoctorResponseDto {
  @ApiProperty({example: 1})
  id: number

  @ApiProperty({example: 'dr.smith@hospital.com'})
  email: string

  @ApiProperty({example: 'John'})
  firstName: string

  @ApiProperty({example: 'Smith'})
  lastName: string

  @ApiProperty({example: 'Dr. John Smith'})
  fullName: string

  @ApiPropertyOptional({example: '+1234567890'})
  phone: string | null

  @ApiProperty({enum: SpecialtyEnum, example: SpecialtyEnum.CARDIOLOGY})
  specialty: SpecialtyEnum

  @ApiProperty({example: 'MD, FACC - Cardiology'})
  qualification: string

  @ApiProperty({example: 15})
  experienceYears: number

  @ApiProperty({example: 200.0})
  consultationFee: number

  @ApiPropertyOptional({example: 'Experienced cardiologist...'})
  bio: string | null

  @ApiPropertyOptional({example: 'City Heart Hospital'})
  hospitalName: string | null

  @ApiPropertyOptional({example: '123 Medical Drive'})
  hospitalAddress: string | null

  @ApiPropertyOptional({example: 'New York'})
  city: string | null

  @ApiPropertyOptional({example: 'NY'})
  state: string | null

  @ApiProperty({enum: DoctorStatusEnum})
  status: DoctorStatusEnum

  @ApiPropertyOptional({example: 'https://example.com/photo.jpg'})
  profilePictureUrl: string | null

  @ApiPropertyOptional({example: 4.8})
  rating: number | null

  @ApiProperty({example: 156})
  totalReviews: number

  @ApiProperty({type: [TimeSlotResponseDto]})
  timeSlots: TimeSlotResponseDto[]

  @ApiProperty()
  createdAt: Date

  static fromEntity(entity: DoctorEntity): DoctorResponseDto {
    const dto = new DoctorResponseDto()

    dto.id = entity.id
    dto.email = entity.email
    dto.firstName = entity.firstName
    dto.lastName = entity.lastName
    dto.fullName = `Dr. ${entity.firstName} ${entity.lastName}`
    dto.phone = entity.phone
    dto.specialty = entity.specialty
    dto.qualification = entity.qualification
    dto.experienceYears = entity.experienceYears
    dto.consultationFee = entity.consultationFee
    dto.bio = entity.bio
    dto.hospitalName = entity.hospitalName
    dto.hospitalAddress = entity.hospitalAddress
    dto.city = entity.city
    dto.state = entity.state
    dto.status = entity.status
    dto.profilePictureUrl = entity.profilePictureUrl
    dto.rating = entity.rating
    dto.totalReviews = entity.totalReviews
    dto.timeSlots = entity.timeSlots?.map(TimeSlotResponseDto.fromEntity) ?? []
    dto.createdAt = entity.createdAt

    return dto
  }
}

export class DoctorListResponseDto {
  @ApiProperty({type: [DoctorResponseDto]})
  data: DoctorResponseDto[]

  @ApiProperty({example: 50})
  total: number

  @ApiProperty({example: 1})
  page: number

  @ApiProperty({example: 10})
  limit: number

  @ApiProperty({example: 5})
  totalPages: number

  static create(
    data: DoctorEntity[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
  ): DoctorListResponseDto {
    const dto = new DoctorListResponseDto()

    dto.data = data.map(DoctorResponseDto.fromEntity)
    dto.total = total
    dto.page = page
    dto.limit = limit
    dto.totalPages = totalPages

    return dto
  }
}
