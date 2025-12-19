import {Controller, Get, Put, Body, UseGuards, Req} from '@nestjs/common'
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger'
import {Request} from 'express'

import {PatientService} from '../services/PatientService'
import {UpdatePatientDto} from '../dtos/UpdatePatientDto'
import {PatientResponseDto} from '../dtos/PatientResponseDto'
import {JwtAuthGuard} from '@modules/auth/application/guards/JwtAuthGuard'

interface IAuthenticatedRequest extends Request {
  user: {
    userId: number
    email: string
    userType: string
  }
}

@ApiTags('Patient')
@Controller('patient')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('profile')
  @ApiOperation({summary: 'Get current patient profile'})
  @ApiResponse({status: 200, description: 'Profile retrieved successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getProfile(@Req() req: IAuthenticatedRequest): Promise<PatientResponseDto> {
    return this.patientService.findById(req.user.userId)
  }

  @Put('profile')
  @ApiOperation({summary: 'Update patient profile'})
  @ApiResponse({status: 200, description: 'Profile updated successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async updateProfile(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientService.update(req.user.userId, dto)
  }
}
