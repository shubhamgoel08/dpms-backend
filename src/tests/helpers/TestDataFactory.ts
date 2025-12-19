import * as bcrypt from 'bcrypt';
import { AdminEntity } from '../../modules/admin/domain/entities/AdminEntity';
import { DoctorEntity } from '../../modules/doctor/domain/entities/DoctorEntity';
import { TimeSlotEntity } from '../../modules/timeSlot/domain/entities/TimeSlotEntity';
import { AppointmentEntity } from '../../modules/appointment/domain/entities/AppointmentEntity';
import { SpecialityEnum } from '../../modules/doctor/domain/enums/SpecialityEnum';
import { SlotStatusEnum } from '../../modules/timeSlot/domain/enums/SlotStatusEnum';
import { AppointmentStatusEnum } from '../../modules/appointment/domain/enums/AppointmentStatusEnum';

export class TestDataFactory {
  static async createAdmin(overrides: Partial<AdminEntity> = {}): Promise<AdminEntity> {
    const admin = new AdminEntity();
    admin.email = overrides.email || `admin_${Date.now()}@test.com`;
    admin.passwordHash = overrides.passwordHash || await bcrypt.hash('TestPassword123', 10);
    admin.name = overrides.name || 'Test Admin';

    Object.assign(admin, overrides);
    return admin;
  }

  static async createDoctor(
    adminId: number = 1,
    overrides: Partial<DoctorEntity> = {},
  ): Promise<DoctorEntity> {
    const doctor = new DoctorEntity();
    doctor.email = overrides.email || `doctor_${Date.now()}@test.com`;
    doctor.passwordHash = overrides.passwordHash || await bcrypt.hash('TestPassword123', 10);
    doctor.name = overrides.name || 'Dr. Test';
    doctor.speciality = overrides.speciality || SpecialityEnum.GENERAL_MEDICINE;
    doctor.phone = overrides.phone || '+1234567890';
    doctor.experienceYears = overrides.experienceYears ?? 5;
    doctor.createdByAdminId = overrides.createdByAdminId || adminId;

    Object.assign(doctor, overrides);
    return doctor;
  }

  static createTimeSlot(
    doctorId: number,
    overrides: Partial<TimeSlotEntity> = {},
  ): TimeSlotEntity {
    const timeSlot = new TimeSlotEntity();
    timeSlot.doctorId = doctorId;
    timeSlot.slotDate = overrides.slotDate || new Date();
    timeSlot.startTime = overrides.startTime || '09:00:00';
    timeSlot.endTime = overrides.endTime || '10:00:00';
    timeSlot.status = overrides.status || SlotStatusEnum.AVAILABLE;

    Object.assign(timeSlot, overrides);
    return timeSlot;
  }

  static createAppointment(
    patientId: number,
    doctorId: number,
    timeSlotId: number,
    overrides: Partial<AppointmentEntity> = {},
  ): AppointmentEntity {
    const appointment = new AppointmentEntity();
    appointment.patientId = patientId;
    appointment.doctorId = doctorId;
    appointment.timeSlotId = timeSlotId;
    appointment.status = overrides.status || AppointmentStatusEnum.SCHEDULED;
    appointment.bookedAt = overrides.bookedAt || new Date();

    Object.assign(appointment, overrides);
    return appointment;
  }

  static generateMultipleDoctors(count: number, adminId: number = 1): Promise<DoctorEntity[]> {
    const specialities = Object.values(SpecialityEnum);
    return Promise.all(
      Array.from({ length: count }, async (_, i) => {
        return this.createDoctor(adminId, {
          email: `doctor${i + 1}@test.com`,
          name: `Dr. Test ${i + 1}`,
          speciality: specialities[i % specialities.length],
          experienceYears: Math.floor(Math.random() * 20) + 1,
        });
      }),
    );
  }

  static generateMultipleTimeSlots(
    doctorId: number,
    count: number,
    date: Date = new Date(),
  ): TimeSlotEntity[] {
    return Array.from({ length: count }, (_, i) => {
      const startHour = 9 + i;
      return this.createTimeSlot(doctorId, {
        slotDate: date,
        startTime: `${startHour.toString().padStart(2, '0')}:00:00`,
        endTime: `${(startHour + 1).toString().padStart(2, '0')}:00:00`,
      });
    });
  }
}
