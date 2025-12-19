import {Controller, Get, Param, Query, ParseIntPipe, ParseEnumPipe} from '@nestjs/common'
import {ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam} from '@nestjs/swagger'

import {DoctorService} from '../services/DoctorService'
import {DoctorSearchDto} from '../dtos/DoctorSearchDto'
import {DoctorResponseDto, DoctorListResponseDto} from '../dtos/DoctorResponseDto'
import {TimeSlotResponseDto} from '../dtos/TimeSlotResponseDto'
import {SpecialtyEnum} from '../../domain/enums/SpecialtyEnum'
import {DayOfWeekEnum} from '../../domain/enums/DayOfWeekEnum'

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @ApiOperation({summary: 'Search doctors with filters'})
  @ApiResponse({status: 200, description: 'List of doctors matching criteria'})
  async search(@Query() searchDto: DoctorSearchDto): Promise<DoctorListResponseDto> {
    return this.doctorService.search(searchDto)
  }

  @Get('specialties')
  @ApiOperation({summary: 'Get all available specialties'})
  @ApiResponse({status: 200, description: 'List of all specialties'})
  async getSpecialties(): Promise<string[]> {
    return this.doctorService.getSpecialties()
  }

  @Get('specialties/available')
  @ApiOperation({summary: 'Get specialties with active doctors'})
  @ApiResponse({status: 200, description: 'List of specialties with available doctors'})
  async getAvailableSpecialties(): Promise<string[]> {
    return this.doctorService.getAvailableSpecialties()
  }

  @Get('specialty/:specialty')
  @ApiOperation({summary: 'Get doctors by specialty'})
  @ApiParam({name: 'specialty', enum: SpecialtyEnum})
  @ApiResponse({status: 200, description: 'List of doctors in the specialty'})
  async findBySpecialty(
    @Param('specialty', new ParseEnumPipe(SpecialtyEnum)) specialty: SpecialtyEnum,
  ): Promise<DoctorResponseDto[]> {
    return this.doctorService.findBySpecialty(specialty)
  }

  @Get(':id')
  @ApiOperation({summary: 'Get doctor details by ID'})
  @ApiParam({name: 'id', type: Number, description: 'Doctor ID'})
  @ApiResponse({status: 200, description: 'Doctor details'})
  @ApiResponse({status: 404, description: 'Doctor not found'})
  async findById(@Param('id', ParseIntPipe) id: number): Promise<DoctorResponseDto> {
    return this.doctorService.findById(id)
  }

  @Get(':id/time-slots')
  @ApiOperation({summary: 'Get available time slots for a doctor'})
  @ApiParam({name: 'id', type: Number, description: 'Doctor ID'})
  @ApiResponse({status: 200, description: 'List of available time slots'})
  @ApiResponse({status: 404, description: 'Doctor not found'})
  async getTimeSlots(@Param('id', ParseIntPipe) id: number): Promise<TimeSlotResponseDto[]> {
    return this.doctorService.getTimeSlots(id)
  }

  @Get(':id/time-slots/:dayOfWeek')
  @ApiOperation({summary: 'Get time slots for a specific day'})
  @ApiParam({name: 'id', type: Number, description: 'Doctor ID'})
  @ApiParam({name: 'dayOfWeek', enum: DayOfWeekEnum})
  @ApiResponse({status: 200, description: 'Time slots for the specified day'})
  @ApiResponse({status: 404, description: 'Doctor not found'})
  async getTimeSlotsByDay(
    @Param('id', ParseIntPipe) id: number,
    @Param('dayOfWeek', new ParseEnumPipe(DayOfWeekEnum)) dayOfWeek: DayOfWeekEnum,
  ): Promise<TimeSlotResponseDto[]> {
    return this.doctorService.getTimeSlotsByDay(id, dayOfWeek)
  }
}
