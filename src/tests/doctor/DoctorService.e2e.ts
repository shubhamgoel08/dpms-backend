import * as request from 'supertest'
import {DataSource} from 'typeorm'

import {createTestApp, closeTestApp, ITestApp} from '../testAppHelper'
import {DoctorEntity} from '@modules/doctor/domain/entities/DoctorEntity'
import {TimeSlotEntity} from '@modules/doctor/domain/entities/TimeSlotEntity'
import {SpecialtyEnum} from '@modules/doctor/domain/enums/SpecialtyEnum'
import {DoctorStatusEnum} from '@modules/doctor/domain/enums/DoctorStatusEnum'
import {DayOfWeekEnum} from '@modules/doctor/domain/enums/DayOfWeekEnum'

/**
 * E2E Tests for DoctorService
 *
 * Tests complete doctor search and listing flows including:
 * - Searching doctors with various filters
 * - Getting doctor details
 * - Getting doctor time slots
 *
 * Uses Testcontainers for a real MySQL database.
 */
describe('DoctorService (e2e)', () => {
  let testApp: ITestApp
  let dataSource: DataSource

  beforeAll(async () => {
    testApp = await createTestApp()
    dataSource = testApp.module.get<DataSource>(DataSource)

    // Seed test doctors
    await seedTestDoctors(dataSource)
  }, 120000)

  afterAll(async () => {
    await closeTestApp(testApp)
  })

  describe('GET /api/doctors', () => {
    it('should return list of active doctors', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page', 1)
      expect(response.body).toHaveProperty('limit', 10)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.total).toBeGreaterThan(0)
    })

    it('should filter doctors by specialty', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .query({specialty: SpecialtyEnum.CARDIOLOGY})
        .expect(200)

      // All returned doctors should have cardiology specialty
      response.body.data.forEach((doctor: {specialty: string}) => {
        expect(doctor.specialty).toBe(SpecialtyEnum.CARDIOLOGY)
      })
    })

    it('should filter doctors by city', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .query({city: 'New York'})
        .expect(200)

      response.body.data.forEach((doctor: {city: string}) => {
        expect(doctor.city).toBe('New York')
      })
    })

    it('should filter doctors by minimum experience', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .query({minExperience: 10})
        .expect(200)

      response.body.data.forEach((doctor: {experienceYears: number}) => {
        expect(doctor.experienceYears).toBeGreaterThanOrEqual(10)
      })
    })

    it('should filter doctors by maximum consultation fee', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .query({maxConsultationFee: 200})
        .expect(200)

      response.body.data.forEach((doctor: {consultationFee: number}) => {
        expect(Number(doctor.consultationFee)).toBeLessThanOrEqual(200)
      })
    })

    it('should support pagination', async () => {
      const page1 = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .query({page: 1, limit: 2})
        .expect(200)

      expect(page1.body.data.length).toBeLessThanOrEqual(2)
      expect(page1.body.page).toBe(1)
      expect(page1.body.limit).toBe(2)
    })

    it('should search doctors by name', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .query({name: 'Smith'})
        .expect(200)

      response.body.data.forEach((doctor: {firstName: string; lastName: string}) => {
        const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
        expect(fullName).toContain('smith')
      })
    })
  })

  describe('GET /api/doctors/:id', () => {
    it('should return doctor details by ID', async () => {
      // First get a doctor from the list
      const listResponse = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .expect(200)

      const doctorId = listResponse.body.data[0].id

      const response = await request(testApp.app.getHttpServer())
        .get(`/api/doctors/${doctorId}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', doctorId)
      expect(response.body).toHaveProperty('email')
      expect(response.body).toHaveProperty('firstName')
      expect(response.body).toHaveProperty('lastName')
      expect(response.body).toHaveProperty('specialty')
      expect(response.body).toHaveProperty('consultationFee')
      expect(response.body).toHaveProperty('timeSlots')

      // Password should never be returned
      expect(response.body).not.toHaveProperty('password')
    })

    it('should return 404 for non-existent doctor', async () => {
      await request(testApp.app.getHttpServer()).get('/api/doctors/99999').expect(404)
    })
  })

  describe('GET /api/doctors/specialties', () => {
    it('should return all specialties', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors/specialties')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body).toContain(SpecialtyEnum.CARDIOLOGY)
      expect(response.body).toContain(SpecialtyEnum.DERMATOLOGY)
    })
  })

  describe('GET /api/doctors/specialties/available', () => {
    it('should return only specialties with active doctors', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/api/doctors/specialties/available')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('GET /api/doctors/:id/time-slots', () => {
    it('should return time slots for a doctor', async () => {
      // Get a doctor first
      const listResponse = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .expect(200)

      const doctorId = listResponse.body.data[0].id

      const response = await request(testApp.app.getHttpServer())
        .get(`/api/doctors/${doctorId}/time-slots`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('dayOfWeek')
        expect(response.body[0]).toHaveProperty('startTime')
        expect(response.body[0]).toHaveProperty('endTime')
        expect(response.body[0]).toHaveProperty('isAvailable')
      }
    })

    it('should return 404 for non-existent doctor', async () => {
      await request(testApp.app.getHttpServer()).get('/api/doctors/99999/time-slots').expect(404)
    })
  })

  describe('GET /api/doctors/:id/time-slots/:dayOfWeek', () => {
    it('should return time slots for a specific day', async () => {
      // Get a doctor first
      const listResponse = await request(testApp.app.getHttpServer())
        .get('/api/doctors')
        .expect(200)

      const doctorId = listResponse.body.data[0].id

      const response = await request(testApp.app.getHttpServer())
        .get(`/api/doctors/${doctorId}/time-slots/monday`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      response.body.forEach((slot: {dayOfWeek: string}) => {
        expect(slot.dayOfWeek).toBe(DayOfWeekEnum.MONDAY)
      })
    })
  })
})

/**
 * Seeds test doctors for E2E testing
 */
async function seedTestDoctors(dataSource: DataSource): Promise<void> {
  const doctorRepository = dataSource.getRepository(DoctorEntity)
  const timeSlotRepository = dataSource.getRepository(TimeSlotEntity)

  // Create test doctors
  const doctors = [
    {
      email: 'dr.smith@test.com',
      password: '$2b$10$hashedpassword123',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1111111111',
      specialty: SpecialtyEnum.CARDIOLOGY,
      qualification: 'MD, FACC',
      experienceYears: 15,
      consultationFee: 250,
      city: 'New York',
      state: 'NY',
      status: DoctorStatusEnum.ACTIVE,
    },
    {
      email: 'dr.johnson@test.com',
      password: '$2b$10$hashedpassword456',
      firstName: 'Emily',
      lastName: 'Johnson',
      phone: '+2222222222',
      specialty: SpecialtyEnum.DERMATOLOGY,
      qualification: 'MD, FAAD',
      experienceYears: 8,
      consultationFee: 150,
      city: 'Los Angeles',
      state: 'CA',
      status: DoctorStatusEnum.ACTIVE,
    },
    {
      email: 'dr.williams@test.com',
      password: '$2b$10$hashedpassword789',
      firstName: 'Michael',
      lastName: 'Williams',
      phone: '+3333333333',
      specialty: SpecialtyEnum.CARDIOLOGY,
      qualification: 'MD, PhD',
      experienceYears: 20,
      consultationFee: 300,
      city: 'New York',
      state: 'NY',
      status: DoctorStatusEnum.ACTIVE,
    },
  ]

  for (const doctorData of doctors) {
    const doctor = doctorRepository.create(doctorData)
    const savedDoctor = await doctorRepository.save(doctor)

    // Create time slots for each doctor
    const timeSlots = [
      {
        doctorId: savedDoctor.id,
        dayOfWeek: DayOfWeekEnum.MONDAY,
        startTime: '09:00',
        endTime: '12:00',
        slotDurationMinutes: 30,
        isAvailable: true,
      },
      {
        doctorId: savedDoctor.id,
        dayOfWeek: DayOfWeekEnum.WEDNESDAY,
        startTime: '14:00',
        endTime: '18:00',
        slotDurationMinutes: 30,
        isAvailable: true,
      },
      {
        doctorId: savedDoctor.id,
        dayOfWeek: DayOfWeekEnum.FRIDAY,
        startTime: '10:00',
        endTime: '15:00',
        slotDurationMinutes: 30,
        isAvailable: true,
      },
    ]

    for (const slotData of timeSlots) {
      const slot = timeSlotRepository.create(slotData)
      await timeSlotRepository.save(slot)
    }
  }
}
