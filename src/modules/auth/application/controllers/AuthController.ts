import {Controller, Post, Body, HttpCode, HttpStatus} from '@nestjs/common'
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger'

import {AuthService} from '../services/AuthService'
import {LoginDto} from '../dtos/LoginDto'
import {AuthResponseDto} from '../dtos/AuthResponseDto'
import {CreatePatientDto} from '@modules/patient/application/dtos/CreatePatientDto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({summary: 'Register a new patient account'})
  @ApiResponse({status: 201, description: 'Registration successful'})
  @ApiResponse({status: 400, description: 'Invalid input data'})
  @ApiResponse({status: 409, description: 'Email already exists'})
  async register(@Body() dto: CreatePatientDto): Promise<AuthResponseDto> {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Login to patient account'})
  @ApiResponse({status: 200, description: 'Login successful'})
  @ApiResponse({status: 401, description: 'Invalid credentials'})
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto)
  }
}
