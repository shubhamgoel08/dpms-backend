import { Injectable } from '@nestjs/common';
import { DoctorService } from '../../../doctor/application/services/DoctorService';
import { TimeSlotService } from '../../../timeSlot/application/services/TimeSlotService';
import { DoctorEntity } from '../../../doctor/domain/entities/DoctorEntity';
import { TimeSlotEntity } from '../../../timeSlot/domain/entities/TimeSlotEntity';
import { SpecialityEnum } from '../../../doctor/domain/enums/SpecialityEnum';

@Injectable()
export class PublicApiService {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly timeSlotService: TimeSlotService,
  ) {}

  async getDoctors(filters?: {
    speciality?: SpecialityEnum;
    experienceYearsMin?: number;
    searchTerm?: string;
  }): Promise<any[]> {
    // For now, get all doctors and filter in memory
    // TODO: Add filter support to DoctorService
    const doctors = await this.doctorService.findAll();

    let filteredDoctors = doctors;

    if (filters?.speciality) {
      filteredDoctors = filteredDoctors.filter(
        (d) => d.speciality === filters.speciality,
      );
    }

    if (filters?.experienceYearsMin) {
      filteredDoctors = filteredDoctors.filter(
        (d) => d.experienceYears >= filters.experienceYearsMin!,
      );
    }

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredDoctors = filteredDoctors.filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.email.toLowerCase().includes(searchLower),
      );
    }

    // Return only safe, public-facing fields
    return filteredDoctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      speciality: doctor.speciality,
      phone: doctor.phone,
      experienceYears: doctor.experienceYears,
    }));
  }

  async getDoctorById(doctorId: number): Promise<any | null> {
    const doctor = await this.doctorService.findById(doctorId);

    // Return only safe, public-facing fields
    return {
      id: doctor.id,
      name: doctor.name,
      speciality: doctor.speciality,
      phone: doctor.phone,
      experienceYears: doctor.experienceYears,
    };
  }

  async getAvailableTimeSlots(
    doctorId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeSlotEntity[]> {
    return await this.timeSlotService.getAvailableTimeSlots(
      doctorId,
      startDate,
      endDate,
    );
  }

  async getAllAvailableTimeSlots(
    startDate?: Date,
    endDate?: Date,
  ): Promise<Map<number, TimeSlotEntity[]>> {
    const doctors = await this.doctorService.findAll();
    const timeSlotsMap = new Map<number, TimeSlotEntity[]>();

    for (const doctor of doctors) {
      const timeSlots = await this.timeSlotService.getAvailableTimeSlots(
        doctor.id,
        startDate,
        endDate,
      );
      if (timeSlots.length > 0) {
        timeSlotsMap.set(doctor.id, timeSlots);
      }
    }

    return timeSlotsMap;
  }
}
