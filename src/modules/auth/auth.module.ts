import {Module} from '@nestjs/common'
import {JwtModule} from '@nestjs/jwt'
import {PassportModule} from '@nestjs/passport'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {AuthService} from './application/services/AuthService'
import {AuthController} from './application/controllers/AuthController'
import {JwtStrategy} from './application/strategies/JwtStrategy'
import {JwtAuthGuard} from './application/guards/JwtAuthGuard'
import {PatientModule} from '@modules/patient/patient.module'

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiration') || '1d',
        },
      }),
    }),
    PatientModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}

