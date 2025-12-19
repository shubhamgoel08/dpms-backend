import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { PublicApiService } from '../services/PublicApiService';
import { DoctorEntity } from '../../../doctor/domain/entities/DoctorEntity';
import { TimeSlotEntity } from '../../../timeSlot/domain/entities/TimeSlotEntity';
import { SpecialityEnum } from '../../../doctor/domain/enums/SpecialityEnum';

@Controller('public')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('doctors')
  async getDoctors(
    @Query('speciality') speciality?: SpecialityEnum,
    @Query('experienceYearsMin', new ParseIntPipe({ optional: true }))
    experienceYearsMin?: number,
    @Query('searchTerm') searchTerm?: string,
  ): Promise<any[]> {
    return this.publicApiService.getDoctors({
      speciality,
      experienceYearsMin,
      searchTerm,
    });
  }

  @Get('doctors/:id')
  async getDoctorById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    const doctor = await this.publicApiService.getDoctorById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  @Get('doctors/:id/available-slots')
  async getAvailableTimeSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimeSlotEntity[]> {
    return this.publicApiService.getAvailableTimeSlots(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('available-slots')
  async getAllAvailableTimeSlots(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const timeSlotsMap = await this.publicApiService.getAllAvailableTimeSlots(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    const result: any = {};
    timeSlotsMap.forEach((timeSlots, doctorId) => {
      result[doctorId] = timeSlots;
    });

    return result;
  }
}
