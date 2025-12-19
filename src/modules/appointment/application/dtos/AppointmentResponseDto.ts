import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger'

import {AppointmentEntity} from '../../domain/entities/AppointmentEntity'
import {AppointmentStatusEnum} from '../../domain/enums/AppointmentStatusEnum'

export class AppointmentDoctorDto {
  @ApiProperty({example: 1})
  id: number

  @ApiProperty({example: 'John'})
  firstName: string

  @ApiProperty({example: 'Smith'})
  lastName: string

  @ApiProperty({example: 'Dr. John Smith'})
  fullName: string

  @ApiProperty({example: 'cardiology'})
  specialty: string

  @ApiPropertyOptional({example: '+1234567890'})
  phone: string | null

  @ApiPropertyOptional({example: 'City Heart Hospital'})
  hospitalName: string | null

  @ApiPropertyOptional({example: 'https://example.com/photo.jpg'})
  profilePictureUrl: string | null
}

export class AppointmentResponseDto {
  @ApiProperty({example: 1})
  id: number

  @ApiProperty({example: 1})
  patientId: number

  @ApiProperty({example: 1})
  doctorId: number

  @ApiProperty({example: '2024-12-25'})
  appointmentDate: Date

  @ApiProperty({example: '10:00'})
  startTime: string

  @ApiProperty({example: '10:30'})
  endTime: string

  @ApiProperty({enum: AppointmentStatusEnum, example: AppointmentStatusEnum.CONFIRMED})
  status: AppointmentStatusEnum

  @ApiPropertyOptional({example: 'General checkup'})
  reason: string | null

  @ApiPropertyOptional({example: 'First time visit'})
  notes: string | null

  @ApiProperty({example: 200.0})
  consultationFee: number

  @ApiPropertyOptional({example: 'Schedule conflict'})
  cancellationReason: string | null

  @ApiPropertyOptional()
  cancelledAt: Date | null

  @ApiPropertyOptional({type: AppointmentDoctorDto})
  doctor: AppointmentDoctorDto | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  static fromEntity(entity: AppointmentEntity): AppointmentResponseDto {
    const dto = new AppointmentResponseDto()

    dto.id = entity.id
    dto.patientId = entity.patientId
    dto.doctorId = entity.doctorId
    dto.appointmentDate = entity.appointmentDate
    dto.startTime = entity.startTime
    dto.endTime = entity.endTime
    dto.status = entity.status
    dto.reason = entity.reason
    dto.notes = entity.notes
    dto.consultationFee = entity.consultationFee
    dto.cancellationReason = entity.cancellationReason
    dto.cancelledAt = entity.cancelledAt
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt

    if (entity.doctor) {
      dto.doctor = {
        id: entity.doctor.id,
        firstName: entity.doctor.firstName,
        lastName: entity.doctor.lastName,
        fullName: `Dr. ${entity.doctor.firstName} ${entity.doctor.lastName}`,
        specialty: entity.doctor.specialty,
        phone: entity.doctor.phone,
        hospitalName: entity.doctor.hospitalName,
        profilePictureUrl: entity.doctor.profilePictureUrl,
      }
    } else {
      dto.doctor = null
    }

    return dto
  }
}
