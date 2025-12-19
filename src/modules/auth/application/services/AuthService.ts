import {Injectable, UnauthorizedException} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import {ConfigService} from '@nestjs/config'

import {PatientService} from '@modules/patient/application/services/PatientService'
import {LoginDto} from '../dtos/LoginDto'
import {AuthResponseDto} from '../dtos/AuthResponseDto'
import {CreatePatientDto} from '@modules/patient/application/dtos/CreatePatientDto'
import {PatientResponseDto} from '@modules/patient/application/dtos/PatientResponseDto'
import {IJwtPayload} from '../strategies/JwtStrategy'

@Injectable()
export class AuthService {
  constructor(
    private readonly patientService: PatientService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreatePatientDto): Promise<AuthResponseDto> {
    const patient = await this.patientService.register(dto)
    return this.buildAuthResponse(patient)
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const patient = await this.patientService.validateCredentials(dto.email, dto.password)

    if (!patient) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const patientResponse = await this.patientService.findById(patient.id)
    return this.buildAuthResponse(patientResponse)
  }

  private buildAuthResponse(patient: PatientResponseDto): AuthResponseDto {
    const payload = this.createJwtPayload(patient)
    const accessToken = this.jwtService.sign(payload)
    const expiresIn = this.configService.get<string>('jwt.expiration') ?? '1d'

    return AuthResponseDto.create(accessToken, expiresIn, patient)
  }

  private createJwtPayload(patient: PatientResponseDto): IJwtPayload {
    return {
      sub: patient.id,
      email: patient.email,
      userType: 'patient',
    }
  }
}
