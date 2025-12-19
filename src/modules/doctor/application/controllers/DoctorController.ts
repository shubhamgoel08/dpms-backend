import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DoctorService } from '../services/DoctorService';
import { DoctorEntity } from '../../domain/entities/DoctorEntity';
import { UpdateDoctorDto } from '../dtos/UpdateDoctorDto';
import { JwtAuthGuard } from '../../../../common/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../common/guards/RolesGuard';
import { Roles } from '../../../../common/decorators/Roles.decorator';
import { CurrentUser } from '../../../../common/decorators/CurrentUser.decorator';
import { UserRoleEnum } from '../../../auth/domain/enums/UserRoleEnum';

@ApiTags('Doctor')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor found' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getDoctorById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DoctorEntity> {
    return this.doctorService.findById(id);
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Update doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async updateDoctor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @CurrentUser() user: any,
  ): Promise<DoctorEntity> {
    const doctor = await this.doctorService.findById(id);

    // Update only provided fields
    if (updateDoctorDto.name) doctor.name = updateDoctorDto.name;
    if (updateDoctorDto.speciality)
      doctor.speciality = updateDoctorDto.speciality;
    if (updateDoctorDto.phone) doctor.phone = updateDoctorDto.phone;
    if (updateDoctorDto.experienceYears !== undefined)
      doctor.experienceYears = updateDoctorDto.experienceYears;

    return this.doctorService.save(doctor);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete doctor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async deleteDoctor(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.doctorService.delete(id);
  }
}
