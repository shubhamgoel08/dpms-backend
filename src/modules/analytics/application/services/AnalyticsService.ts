import { Injectable } from '@nestjs/common';
import { AppointmentService } from '../../../appointment/application/services/AppointmentService';

export interface AnalyticsData {
  mostBookedDoctors: Array<{
    doctorId: number;
    doctorName: string;
    bookingCount: number;
  }>;
  mostBookedSpecialities: Array<{
    speciality: string;
    bookingCount: number;
  }>;
  mostBookedTimeSlots: Array<{
    startTime: string;
    endTime: string;
    bookingCount: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  async getAnalytics(limit: number = 10): Promise<AnalyticsData> {
    const [mostBookedDoctors, mostBookedSpecialities, mostBookedTimeSlots] =
      await Promise.all([
        this.appointmentService.getMostBookedDoctors(limit),
        this.appointmentService.getMostBookedSpecialities(limit),
        this.appointmentService.getMostBookedTimeSlots(limit),
      ]);

    return {
      mostBookedDoctors: mostBookedDoctors.map((item) => ({
        doctorId: item.doctorId,
        doctorName: item.doctorName,
        bookingCount: parseInt(item.bookingCount, 10),
      })),
      mostBookedSpecialities: mostBookedSpecialities.map((item) => ({
        speciality: item.speciality,
        bookingCount: parseInt(item.bookingCount, 10),
      })),
      mostBookedTimeSlots: mostBookedTimeSlots.map((item) => ({
        startTime: item.startTime,
        endTime: item.endTime,
        bookingCount: parseInt(item.bookingCount, 10),
      })),
    };
  }

  async getMostBookedDoctors(limit: number = 10) {
    const results = await this.appointmentService.getMostBookedDoctors(limit);
    return results.map((item) => ({
      doctorId: item.doctorId,
      doctorName: item.doctorName,
      bookingCount: parseInt(item.bookingCount, 10),
    }));
  }

  async getMostBookedSpecialities(limit: number = 10) {
    const results =
      await this.appointmentService.getMostBookedSpecialities(limit);
    return results.map((item) => ({
      speciality: item.speciality,
      bookingCount: parseInt(item.bookingCount, 10),
    }));
  }

  async getMostBookedTimeSlots(limit: number = 10) {
    const results = await this.appointmentService.getMostBookedTimeSlots(limit);
    return results.map((item) => ({
      startTime: item.startTime,
      endTime: item.endTime,
      bookingCount: parseInt(item.bookingCount, 10),
    }));
  }
}
