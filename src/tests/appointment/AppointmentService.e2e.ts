import * as request from 'supertest'
import {DataSource} from 'typeorm'

import {createTestApp, closeTestApp, ITestApp} from '../testAppHelper'
import {DoctorEntity} from '@modules/doctor/domain/entities/DoctorEntity'
import {TimeSlotEntity} from '@modules/doctor/domain/entities/TimeSlotEntity'
import {SpecialtyEnum} from '@modules/doctor/domain/enums/SpecialtyEnum'
import {DoctorStatusEnum} from '@modules/doctor/domain/enums/DoctorStatusEnum'
import {DayOfWeekEnum} from '@modules/doctor/domain/enums/DayOfWeekEnum'

/**
 * E2E Tests for AppointmentService
 *
 * Tests complete appointment booking flows including:
 * - Creating appointments
 * - Viewing appointments
 * - Cancelling appointments
 * - Checking available slots
 *
 * Uses Testcontainers for a real MySQL database.
 */
describe('AppointmentService (e2e)', () => {
  let testApp: ITestApp
  let dataSource: DataSource
  let authToken: string
  let patientId: number
  let doctorId: number

  beforeAll(async () => {
    testApp = await createTestApp()
    dataSource = testApp.module.get<DataSource>(DataSource)

    // Seed test doctor
    doctorId = await seedTestDoctor(dataSource)

    // Register a patient and get auth token
    const registerResponse = await request(testApp.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'patient.appointment@test.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'Patient',
      })

    authToken = registerResponse.body.accessToken
    patientId = registerResponse.body.user.id
  }, 120000)

  afterAll(async () => {
    await closeTestApp(testApp)
  })

  describe('POST /api/appointments', () => {
    it('should create an appointment with valid data', async () => {
      // Get a future date (next Monday)
      const futureDate = getNextWeekday(1) // 1 = Monday

      const appointmentData = {
        doctorId,
        appointmentDate: futureDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        reason: 'General checkup',
        notes: 'First visit',
      }

      const response = await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('status', 'confirmed')
      expect(response.body).toHaveProperty('startTime', '09:00')
      expect(response.body).toHaveProperty('endTime', '09:30')
      expect(response.body).toHaveProperty('doctor')
      expect(response.body.doctor.id).toBe(doctorId)
    })

    it('should return 400 for past appointment date', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)

      await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          doctorId,
          appointmentDate: pastDate.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '10:30',
        })
        .expect(400)
    })

    it('should return 400 for already booked slot', async () => {
      const futureDate = getNextWeekday(3) // Wednesday

      const appointmentData = {
        doctorId,
        appointmentDate: futureDate.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '14:30',
      }

      // Book first appointment
      await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(201)

      // Try to book same slot again
      const response = await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(400)

      expect(response.body.message).toContain('not available')
    })

    it('should return 401 without authentication', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .send({
          doctorId,
          appointmentDate: '2025-12-25',
          startTime: '10:00',
          endTime: '10:30',
        })
        .expect(401)
    })

    it('should return 404 for non-existent doctor', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          doctorId: 99999,
          appointmentDate: getNextWeekday(1).toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '10:30',
        })
        .expect(404)
    })
  })

  describe('GET /api/appointments', () => {
    it('should return all appointments for the patient', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      // All appointments should belong to the authenticated patient
      response.body.forEach((appointment: {patient: {id: number}}) => {
        expect(appointment.patient.id).toBe(patientId)
      })
    })

    it('should return 401 without authentication', async () => {
      await request(testApp.app.getHttpServer()).get('/api/appointments').expect(401)
    })
  })

  describe('GET /api/appointments/upcoming', () => {
    it('should return only upcoming appointments', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/appointments/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      response.body.forEach((appointment: {appointmentDate: string}) => {
        const appointmentDate = new Date(appointment.appointmentDate)
        expect(appointmentDate.getTime()).toBeGreaterThanOrEqual(today.getTime())
      })
    })
  })

  describe('GET /api/appointments/:id', () => {
    it('should return appointment details', async () => {
      // First create an appointment
      const futureDate = getNextWeekday(5) // Friday

      const createResponse = await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          doctorId,
          appointmentDate: futureDate.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '10:30',
          reason: 'Consultation',
        })
        .expect(201)

      const appointmentId = createResponse.body.id

      // Get appointment details
      const response = await request(testApp.app.getHttpServer())
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.id).toBe(appointmentId)
      expect(response.body).toHaveProperty('doctor')
      expect(response.body).toHaveProperty('patient')
    })

    it('should return 404 for non-existent appointment', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/appointments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 403 for appointment belonging to another patient', async () => {
      // Register another patient
      const anotherPatientResponse = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'another.patient@test.com',
          password: 'AnotherPass123!',
          firstName: 'Another',
          lastName: 'Patient',
        })

      const anotherToken = anotherPatientResponse.body.accessToken

      // Create appointment with first patient
      const futureDate = getNextWeekday(1)
      futureDate.setDate(futureDate.getDate() + 7) // Next week

      const createResponse = await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          doctorId,
          appointmentDate: futureDate.toISOString().split('T')[0],
          startTime: '11:00',
          endTime: '11:30',
        })
        .expect(201)

      // Try to access with another patient's token
      await request(testApp.app.getHttpServer())
        .get(`/api/appointments/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(403)
    })
  })

  describe('PUT /api/appointments/:id/cancel', () => {
    it('should cancel an appointment', async () => {
      // Create an appointment first
      const futureDate = getNextWeekday(3) // Wednesday
      futureDate.setDate(futureDate.getDate() + 14) // Two weeks from now

      const createResponse = await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          doctorId,
          appointmentDate: futureDate.toISOString().split('T')[0],
          startTime: '15:00',
          endTime: '15:30',
        })
        .expect(201)

      const appointmentId = createResponse.body.id

      // Cancel the appointment
      const response = await request(testApp.app.getHttpServer())
        .put(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cancellationReason: 'Schedule conflict',
        })
        .expect(200)

      expect(response.body.status).toBe('cancelled')
      expect(response.body.cancellationReason).toBe('Schedule conflict')
    })

    it('should return 400 when cancelling already cancelled appointment', async () => {
      // Create and cancel an appointment
      const futureDate = getNextWeekday(5) // Friday
      futureDate.setDate(futureDate.getDate() + 21) // Three weeks from now

      const createResponse = await request(testApp.app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          doctorId,
          appointmentDate: futureDate.toISOString().split('T')[0],
          startTime: '12:00',
          endTime: '12:30',
        })
        .expect(201)

      const appointmentId = createResponse.body.id

      // Cancel once
      await request(testApp.app.getHttpServer())
        .put(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200)

      // Try to cancel again
      const response = await request(testApp.app.getHttpServer())
        .put(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.message).toContain('already cancelled')
    })
  })

  describe('GET /api/appointments/available-slots', () => {
    it('should return available slots for a doctor on a specific date', async () => {
      const futureDate = getNextWeekday(1) // Monday
      futureDate.setDate(futureDate.getDate() + 28) // Four weeks from now

      const response = await request(testApp.app.getHttpServer())
        .get('/api/appointments/available-slots')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          doctorId,
          date: futureDate.toISOString().split('T')[0],
        })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      response.body.forEach((slot: {startTime: string; endTime: string}) => {
        expect(slot).toHaveProperty('startTime')
        expect(slot).toHaveProperty('endTime')
      })
    })
  })
})

/**
 * Seeds a test doctor for appointment E2E tests
 */
async function seedTestDoctor(dataSource: DataSource): Promise<number> {
  const doctorRepository = dataSource.getRepository(DoctorEntity)
  const timeSlotRepository = dataSource.getRepository(TimeSlotEntity)

  const doctor = doctorRepository.create({
    email: 'dr.appointment.test@test.com',
    password: '$2b$10$hashedpassword',
    firstName: 'Appointment',
    lastName: 'Doctor',
    phone: '+9999999999',
    specialty: SpecialtyEnum.GENERAL_MEDICINE,
    qualification: 'MD',
    experienceYears: 10,
    consultationFee: 100,
    city: 'Test City',
    state: 'TS',
    status: DoctorStatusEnum.ACTIVE,
  })

  const savedDoctor = await doctorRepository.save(doctor)

  // Create time slots for Monday, Wednesday, Friday
  const timeSlots = [
    {
      doctorId: savedDoctor.id,
      dayOfWeek: DayOfWeekEnum.MONDAY,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      isAvailable: true,
    },
    {
      doctorId: savedDoctor.id,
      dayOfWeek: DayOfWeekEnum.WEDNESDAY,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      isAvailable: true,
    },
    {
      doctorId: savedDoctor.id,
      dayOfWeek: DayOfWeekEnum.FRIDAY,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: 30,
      isAvailable: true,
    },
  ]

  for (const slotData of timeSlots) {
    const slot = timeSlotRepository.create(slotData)
    await timeSlotRepository.save(slot)
  }

  return savedDoctor.id
}

/**
 * Gets the next occurrence of a specific weekday
 * @param dayOfWeek 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
function getNextWeekday(dayOfWeek: number): Date {
  const today = new Date()
  const daysUntilTarget = (dayOfWeek - today.getDay() + 7) % 7 || 7
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + daysUntilTarget)
  return targetDate
}
