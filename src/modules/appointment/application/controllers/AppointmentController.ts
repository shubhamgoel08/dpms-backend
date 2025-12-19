import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common'
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam} from '@nestjs/swagger'
import {Request} from 'express'

import {AppointmentService} from '../services/AppointmentService'
import {CreateAppointmentDto} from '../dtos/CreateAppointmentDto'
import {CancelAppointmentDto} from '../dtos/CancelAppointmentDto'
import {AppointmentResponseDto} from '../dtos/AppointmentResponseDto'
import {JwtAuthGuard} from '@modules/auth/application/guards/JwtAuthGuard'

interface IAuthenticatedRequest extends Request {
  user: {
    userId: number
    email: string
    userType: string
  }
}

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({summary: 'Book a new appointment'})
  @ApiResponse({status: 201, description: 'Appointment booked successfully'})
  @ApiResponse({status: 400, description: 'Invalid input or slot unavailable'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 404, description: 'Doctor not found'})
  async create(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.createAppointment(req.user.userId, dto)
  }

  @Get()
  @ApiOperation({summary: 'Get all appointments'})
  @ApiResponse({status: 200, description: 'List of all appointments'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async findAll(@Req() req: IAuthenticatedRequest): Promise<AppointmentResponseDto[]> {
    return this.appointmentService.findAllByPatient(req.user.userId)
  }

  @Get('upcoming')
  @ApiOperation({summary: 'Get upcoming appointments'})
  @ApiResponse({status: 200, description: 'List of upcoming appointments'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async findUpcoming(@Req() req: IAuthenticatedRequest): Promise<AppointmentResponseDto[]> {
    return this.appointmentService.findUpcomingByPatient(req.user.userId)
  }

  @Get('past')
  @ApiOperation({summary: 'Get past appointments'})
  @ApiResponse({status: 200, description: 'List of past appointments'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async findPast(@Req() req: IAuthenticatedRequest): Promise<AppointmentResponseDto[]> {
    return this.appointmentService.findPastByPatient(req.user.userId)
  }

  @Get('available-slots')
  @ApiOperation({summary: 'Get available slots for a doctor on a date'})
  @ApiQuery({name: 'doctorId', type: Number, required: true})
  @ApiQuery({name: 'date', type: String, required: true, description: 'Date in YYYY-MM-DD format'})
  @ApiResponse({status: 200, description: 'List of available time slots'})
  @ApiResponse({status: 404, description: 'Doctor not found'})
  async getAvailableSlots(
    @Query('doctorId', ParseIntPipe) doctorId: number,
    @Query('date') date: string,
  ): Promise<{startTime: string; endTime: string}[]> {
    return this.appointmentService.getAvailableSlots(doctorId, date)
  }

  @Get(':id')
  @ApiOperation({summary: 'Get appointment details'})
  @ApiParam({name: 'id', type: Number, description: 'Appointment ID'})
  @ApiResponse({status: 200, description: 'Appointment details'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Access denied'})
  @ApiResponse({status: 404, description: 'Appointment not found'})
  async findById(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.findById(id, req.user.userId)
  }

  @Put(':id/cancel')
  @ApiOperation({summary: 'Cancel an appointment'})
  @ApiParam({name: 'id', type: Number, description: 'Appointment ID'})
  @ApiResponse({status: 200, description: 'Appointment cancelled'})
  @ApiResponse({status: 400, description: 'Cannot cancel appointment'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Access denied'})
  @ApiResponse({status: 404, description: 'Appointment not found'})
  async cancel(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.cancelAppointment(id, req.user.userId, dto)
  }
}
