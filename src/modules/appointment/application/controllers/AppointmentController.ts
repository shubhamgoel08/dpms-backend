import {
  Controller,
  Get,
  Post,
  Put,
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
import { AppointmentService } from '../services/AppointmentService';
import { AppointmentEntity } from '../../domain/entities/AppointmentEntity';
import { CreateAppointmentDto } from '../dtos/CreateAppointmentDto';
import { UpdateAppointmentDto } from '../dtos/UpdateAppointmentDto';
import { JwtAuthGuard } from '../../../../common/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../common/guards/RolesGuard';
import { Roles } from '../../../../common/decorators/Roles.decorator';
import { UserRoleEnum } from '../../../auth/domain/enums/UserRoleEnum';
import { AppointmentStatusEnum } from '../../domain/enums/AppointmentStatusEnum';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a new appointment (Admin only)' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const appointment = new AppointmentEntity();
    appointment.patientId = createAppointmentDto.patientId;
    appointment.doctorId = createAppointmentDto.doctorId;
    appointment.timeSlotId = createAppointmentDto.timeSlotId;
    appointment.status = AppointmentStatusEnum.SCHEDULED;
    appointment.bookedAt = new Date();

    return this.appointmentService.save(appointment);
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointmentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AppointmentEntity> {
    return this.appointmentService.findById(id);
  }

  @Get('doctor/:doctorId')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Get all appointments for a doctor' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async getAppointmentsByDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
  ): Promise<AppointmentEntity[]> {
    return this.appointmentService.findByDoctorId(doctorId);
  }

  @Get('patient/:patientId')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all appointments for a patient' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async getAppointmentsByPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
  ): Promise<AppointmentEntity[]> {
    return this.appointmentService.findByPatientId(patientId);
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async updateAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const appointment = await this.appointmentService.findById(id);

    if (updateAppointmentDto.status) {
      appointment.status = updateAppointmentDto.status;
    }

    return this.appointmentService.save(appointment);
  }
}
