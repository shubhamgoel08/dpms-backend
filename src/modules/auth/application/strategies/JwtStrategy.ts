import {Injectable, UnauthorizedException} from '@nestjs/common'
import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {ConfigService} from '@nestjs/config'
import {PatientService} from '@modules/patient/application/services/PatientService'

export interface IJwtPayload {
  sub: number
  email: string
  userType: string
  iat?: number
  exp?: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly patientService: PatientService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    })
  }

  async validate(payload: IJwtPayload) {
    if (payload.userType !== 'patient') {
      throw new UnauthorizedException('Invalid token')
    }

    const patient = await this.patientService.findById(payload.sub)
    if (!patient) {
      throw new UnauthorizedException('User not found')
    }

    return {
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType,
    }
  }
}

