import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../services/AdminService';
import { CreateDoctorDto } from '../dtos/CreateDoctorDto';
import { DoctorEntity } from '../../../doctor/domain/entities/DoctorEntity';
import { JwtAuthGuard } from '../../../../common/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../common/guards/RolesGuard';
import { Roles } from '../../../../common/decorators/Roles.decorator';
import { CurrentUser } from '../../../../common/decorators/CurrentUser.decorator';
import { UserRoleEnum } from '../../../auth/domain/enums/UserRoleEnum';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('doctors')
  @ApiOperation({ summary: 'Create a new doctor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Doctor already exists' })
  async createDoctor(
    @Body() createDoctorDto: CreateDoctorDto,
    @CurrentUser() user: any,
  ): Promise<DoctorEntity> {
    return this.adminService.createDoctor(createDoctorDto, user.id);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Get all doctors (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all doctors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllDoctors(): Promise<DoctorEntity[]> {
    return this.adminService.getAllDoctors();
  }

  @Get('doctors/:id')
  async getDoctorById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DoctorEntity> {
    return this.adminService.getDoctorById(id);
  }
}
