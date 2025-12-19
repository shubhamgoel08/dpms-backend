import {Injectable, ConflictException, NotFoundException} from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import {PatientRepository} from '../../domain/repositories/PatientRepository'
import {PatientEntity} from '../../domain/entities/PatientEntity'
import {CreatePatientDto} from '../dtos/CreatePatientDto'
import {UpdatePatientDto} from '../dtos/UpdatePatientDto'
import {PatientResponseDto} from '../dtos/PatientResponseDto'
import {PatientStatusEnum} from '../../domain/enums/PatientStatusEnum'

const SALT_ROUNDS = 10

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async register(dto: CreatePatientDto): Promise<PatientResponseDto> {
    const existingPatient = await this.patientRepository.findByEmail(dto.email)

    if (existingPatient) {
      throw new ConflictException('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS)

    const patient = this.createPatientEntity(dto, hashedPassword)
    const savedPatient = await this.patientRepository.save(patient)

    return PatientResponseDto.fromEntity(savedPatient)
  }

  async findById(patientId: number): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(patientId)

    if (!patient) {
      throw new NotFoundException('Patient not found')
    }

    return PatientResponseDto.fromEntity(patient)
  }

  async findByEmail(email: string): Promise<PatientEntity | null> {
    return this.patientRepository.findByEmail(email)
  }

  async update(patientId: number, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(patientId)

    if (!patient) {
      throw new NotFoundException('Patient not found')
    }

    const updateData = this.buildUpdateData(dto)
    await this.patientRepository.update(patientId, updateData)

    return this.findById(patientId)
  }

  async validateCredentials(email: string, password: string): Promise<PatientEntity | null> {
    const patient = await this.patientRepository.findByEmail(email)

    if (!patient) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, patient.password)

    return isPasswordValid ? patient : null
  }

  private createPatientEntity(dto: CreatePatientDto, hashedPassword: string): PatientEntity {
    const patient = new PatientEntity()

    patient.email = dto.email
    patient.password = hashedPassword
    patient.firstName = dto.firstName
    patient.lastName = dto.lastName
    patient.phone = dto.phone ?? null
    patient.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null
    patient.gender = dto.gender ?? null
    patient.address = dto.address ?? null
    patient.city = dto.city ?? null
    patient.state = dto.state ?? null
    patient.zipCode = dto.zipCode ?? null
    patient.status = PatientStatusEnum.ACTIVE
    patient.profilePictureUrl = null

    return patient
  }

  private buildUpdateData(dto: UpdatePatientDto): Partial<PatientEntity> {
    const updateData: Partial<PatientEntity> = {}

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName
    if (dto.phone !== undefined) updateData.phone = dto.phone
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dto.dateOfBirth)
    if (dto.gender !== undefined) updateData.gender = dto.gender
    if (dto.address !== undefined) updateData.address = dto.address
    if (dto.city !== undefined) updateData.city = dto.city
    if (dto.state !== undefined) updateData.state = dto.state
    if (dto.zipCode !== undefined) updateData.zipCode = dto.zipCode
    if (dto.profilePictureUrl !== undefined) updateData.profilePictureUrl = dto.profilePictureUrl

    return updateData
  }
}
