import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'

import {AppointmentRepository} from '../../domain/repositories/AppointmentRepository'
import {AppointmentEntity} from '../../domain/entities/AppointmentEntity'
import {CreateAppointmentDto} from '../dtos/CreateAppointmentDto'
import {CancelAppointmentDto} from '../dtos/CancelAppointmentDto'
import {AppointmentResponseDto} from '../dtos/AppointmentResponseDto'
import {AppointmentStatusEnum} from '../../domain/enums/AppointmentStatusEnum'
import {DoctorService} from '@modules/doctor/application/services/DoctorService'
import {NotificationService} from '@modules/notification/application/services/NotificationService'

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorService: DoctorService,
    private readonly notificationService: NotificationService,
  ) {}

  async createAppointment(
    patientId: number,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const doctor = await this.doctorService.findById(dto.doctorId)
    const appointmentDate = new Date(dto.appointmentDate)

    this.validateAppointmentDate(appointmentDate)
    await this.validateSlotAvailability(dto.doctorId, appointmentDate, dto.startTime, dto.endTime)

    const appointment = this.createAppointmentEntity(patientId, dto, appointmentDate, doctor.consultationFee)
    const savedAppointment = await this.appointmentRepository.save(appointment)

    await this.sendConfirmationEmail(doctor, patientId, appointmentDate, dto)

    const fullAppointment = await this.appointmentRepository.findById(savedAppointment.id)
    return AppointmentResponseDto.fromEntity(fullAppointment!)
  }

  async findById(appointmentId: number, patientId: number): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    this.validatePatientAccess(appointment.patientId, patientId)

    return AppointmentResponseDto.fromEntity(appointment)
  }

  async findAllByPatient(patientId: number): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentRepository.findByPatientId(patientId)
    return appointments.map(AppointmentResponseDto.fromEntity)
  }

  async findUpcomingByPatient(patientId: number): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentRepository.findUpcomingByPatientId(patientId)
    return appointments.map(AppointmentResponseDto.fromEntity)
  }

  async findPastByPatient(patientId: number): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentRepository.findPastByPatientId(patientId)
    return appointments.map(AppointmentResponseDto.fromEntity)
  }

  async cancelAppointment(
    appointmentId: number,
    patientId: number,
    dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    this.validatePatientAccess(appointment.patientId, patientId)
    this.validateCancellationEligibility(appointment.status)

    await this.appointmentRepository.update(appointmentId, {
      status: AppointmentStatusEnum.CANCELLED,
      cancellationReason: dto.cancellationReason ?? null,
      cancelledAt: new Date(),
    })

    const updatedAppointment = await this.appointmentRepository.findById(appointmentId)
    return AppointmentResponseDto.fromEntity(updatedAppointment!)
  }

  async getAvailableSlots(
    doctorId: number,
    date: string,
  ): Promise<{startTime: string; endTime: string}[]> {
    const doctor = await this.doctorService.findById(doctorId)
    const appointmentDate = new Date(date)

    const bookedAppointments = await this.appointmentRepository.findByDoctorIdAndDate(
      doctorId,
      appointmentDate,
    )

    const dayOfWeek = this.getDayOfWeek(appointmentDate)
    const doctorSlots = doctor.timeSlots.filter(
      slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable,
    )

    return this.calculateAvailableSlots(doctorSlots, bookedAppointments)
  }

  private validateAppointmentDate(date: Date): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) {
      throw new BadRequestException('Appointment date cannot be in the past')
    }
  }

  private async validateSlotAvailability(
    doctorId: number,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const isAvailable = await this.appointmentRepository.checkSlotAvailability(
      doctorId,
      date,
      startTime,
      endTime,
    )

    if (!isAvailable) {
      throw new BadRequestException('The selected time slot is not available')
    }
  }

  private validatePatientAccess(appointmentPatientId: number, requestingPatientId: number): void {
    if (appointmentPatientId !== requestingPatientId) {
      throw new ForbiddenException('You do not have access to this appointment')
    }
  }

  private validateCancellationEligibility(status: AppointmentStatusEnum): void {
    if (status === AppointmentStatusEnum.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled')
    }

    if (status === AppointmentStatusEnum.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment')
    }
  }

  private createAppointmentEntity(
    patientId: number,
    dto: CreateAppointmentDto,
    appointmentDate: Date,
    consultationFee: number,
  ): AppointmentEntity {
    const appointment = new AppointmentEntity()

    appointment.patientId = patientId
    appointment.doctorId = dto.doctorId
    appointment.appointmentDate = appointmentDate
    appointment.startTime = dto.startTime
    appointment.endTime = dto.endTime
    appointment.status = AppointmentStatusEnum.CONFIRMED
    appointment.reason = dto.reason ?? null
    appointment.notes = dto.notes ?? null
    appointment.consultationFee = consultationFee

    return appointment
  }

  private async sendConfirmationEmail(
    doctor: {email: string; fullName: string},
    patientId: number,
    appointmentDate: Date,
    dto: CreateAppointmentDto,
  ): Promise<void> {
    await this.notificationService.sendAppointmentConfirmationToDoctor({
      doctorEmail: doctor.email,
      doctorName: doctor.fullName,
      patientId,
      appointmentDate: appointmentDate.toDateString(),
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    })
  }

  private getDayOfWeek(date: Date): string {
    return date.toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()
  }

  private calculateAvailableSlots(
    doctorSlots: {startTime: string; endTime: string; slotDurationMinutes: number}[],
    bookedAppointments: AppointmentEntity[],
  ): {startTime: string; endTime: string}[] {
    const availableSlots: {startTime: string; endTime: string}[] = []

    for (const slot of doctorSlots) {
      const slotStartMinutes = this.timeToMinutes(slot.startTime)
      const slotEndMinutes = this.timeToMinutes(slot.endTime)
      const duration = slot.slotDurationMinutes

      for (let time = slotStartMinutes; time + duration <= slotEndMinutes; time += duration) {
        const slotStart = this.minutesToTime(time)
        const slotEnd = this.minutesToTime(time + duration)

        const isBooked = this.isSlotBooked(bookedAppointments, time, duration)

        if (!isBooked) {
          availableSlots.push({startTime: slotStart, endTime: slotEnd})
        }
      }
    }

    return availableSlots
  }

  private isSlotBooked(
    appointments: AppointmentEntity[],
    slotStart: number,
    duration: number,
  ): boolean {
    return appointments.some(appt => {
      const apptStart = this.timeToMinutes(appt.startTime)
      const apptEnd = this.timeToMinutes(appt.endTime)

      return (
        (slotStart >= apptStart && slotStart < apptEnd) ||
        (slotStart + duration > apptStart && slotStart + duration <= apptEnd)
      )
    })
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
}
