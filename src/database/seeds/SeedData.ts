import {DataSource} from 'typeorm'
import * as bcrypt from 'bcrypt'
import {DoctorEntity} from '../../modules/doctor/domain/entities/DoctorEntity'
import {TimeSlotEntity} from '../../modules/doctor/domain/entities/TimeSlotEntity'
import {SpecialtyEnum} from '../../modules/doctor/domain/enums/SpecialtyEnum'
import {DoctorStatusEnum} from '../../modules/doctor/domain/enums/DoctorStatusEnum'
import {DayOfWeekEnum} from '../../modules/doctor/domain/enums/DayOfWeekEnum'

export const seedDoctors = async (dataSource: DataSource): Promise<void> => {
  const doctorRepository = dataSource.getRepository(DoctorEntity)
  const timeSlotRepository = dataSource.getRepository(TimeSlotEntity)

  const existingDoctors = await doctorRepository.count()
  if (existingDoctors > 0) {
    console.log('Doctors already exist, skipping seed.')
    return
  }

  const hashedPassword = await bcrypt.hash('DoctorPassword123!', 10)
  const now = new Date()

  const doctorsData = [
    {
      email: 'dr.smith@hospital.com',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567890',
      specialty: SpecialtyEnum.CARDIOLOGY,
      qualification: 'MD, FACC - Cardiology',
      experienceYears: 15,
      consultationFee: 200,
      bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
      hospitalName: 'City Heart Hospital',
      hospitalAddress: '123 Medical Drive',
      city: 'New York',
      state: 'NY',
      rating: 4.8,
      totalReviews: 156,
    },
    {
      email: 'shubhamgoel161@gmail.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      phone: '+1234567891',
      specialty: SpecialtyEnum.DERMATOLOGY,
      qualification: 'MD, Board Certified Dermatologist',
      experienceYears: 10,
      consultationFee: 150,
      bio: 'Specialist in skin conditions, cosmetic dermatology, and skin cancer treatment.',
      hospitalName: 'Skin Care Clinic',
      hospitalAddress: '456 Health Ave',
      city: 'Los Angeles',
      state: 'CA',
      rating: 4.9,
      totalReviews: 203,
    },
    {
      email: 'dr.williams@hospital.com',
      firstName: 'Michael',
      lastName: 'Williams',
      phone: '+1234567892',
      specialty: SpecialtyEnum.ORTHOPEDICS,
      qualification: 'MD, MS - Orthopedics',
      experienceYears: 20,
      consultationFee: 250,
      bio: 'Expert in joint replacement, sports medicine, and trauma surgery.',
      hospitalName: 'Orthopedic Excellence Center',
      hospitalAddress: '789 Bone Street',
      city: 'Chicago',
      state: 'IL',
      rating: 4.7,
      totalReviews: 312,
    },
    {
      email: 'dr.brown@hospital.com',
      firstName: 'Sarah',
      lastName: 'Brown',
      phone: '+1234567893',
      specialty: SpecialtyEnum.PEDIATRICS,
      qualification: 'MD, FAAP - Pediatrics',
      experienceYears: 12,
      consultationFee: 120,
      bio: 'Dedicated pediatrician providing comprehensive care for children.',
      hospitalName: "Children's Medical Center",
      hospitalAddress: '321 Kids Lane',
      city: 'Houston',
      state: 'TX',
      rating: 4.95,
      totalReviews: 428,
    },
    {
      email: 'dr.davis@hospital.com',
      firstName: 'Robert',
      lastName: 'Davis',
      phone: '+1234567894',
      specialty: SpecialtyEnum.NEUROLOGY,
      qualification: 'MD, PhD - Neurology',
      experienceYears: 18,
      consultationFee: 300,
      bio: 'Specializing in neurological disorders, stroke treatment, and brain health.',
      hospitalName: 'Neuroscience Institute',
      hospitalAddress: '555 Brain Blvd',
      city: 'Boston',
      state: 'MA',
      rating: 4.85,
      totalReviews: 189,
    },
    {
      email: 'dr.miller@hospital.com',
      firstName: 'Jennifer',
      lastName: 'Miller',
      phone: '+1234567895',
      specialty: SpecialtyEnum.GYNECOLOGY,
      qualification: 'MD, FACOG - OB/GYN',
      experienceYears: 14,
      consultationFee: 180,
      bio: "Comprehensive women's health care including prenatal and reproductive health.",
      hospitalName: "Women's Health Center",
      hospitalAddress: '777 Care Circle',
      city: 'San Francisco',
      state: 'CA',
      rating: 4.9,
      totalReviews: 267,
    },
    {
      email: 'dr.garcia@hospital.com',
      firstName: 'Carlos',
      lastName: 'Garcia',
      phone: '+1234567896',
      specialty: SpecialtyEnum.GENERAL_MEDICINE,
      qualification: 'MD - Internal Medicine',
      experienceYears: 8,
      consultationFee: 100,
      bio: 'Primary care physician focused on preventive medicine.',
      hospitalName: 'Community Health Clinic',
      hospitalAddress: '999 Main Street',
      city: 'Miami',
      state: 'FL',
      rating: 4.6,
      totalReviews: 145,
    },
    {
      email: 'dr.martinez@hospital.com',
      firstName: 'Maria',
      lastName: 'Martinez',
      phone: '+1234567897',
      specialty: SpecialtyEnum.PSYCHIATRY,
      qualification: 'MD - Psychiatry',
      experienceYears: 11,
      consultationFee: 175,
      bio: 'Mental health specialist focusing on anxiety and depression.',
      hospitalName: 'Mental Wellness Center',
      hospitalAddress: '444 Peace Ave',
      city: 'Seattle',
      state: 'WA',
      rating: 4.75,
      totalReviews: 198,
    },
  ]

  const doctors: DoctorEntity[] = doctorsData.map(data => {
    const doctor = new DoctorEntity()
    doctor.email = data.email
    doctor.password = hashedPassword
    doctor.firstName = data.firstName
    doctor.lastName = data.lastName
    doctor.phone = data.phone
    doctor.specialty = data.specialty
    doctor.qualification = data.qualification
    doctor.experienceYears = data.experienceYears
    doctor.consultationFee = data.consultationFee
    doctor.bio = data.bio
    doctor.hospitalName = data.hospitalName
    doctor.hospitalAddress = data.hospitalAddress
    doctor.city = data.city
    doctor.state = data.state
    doctor.status = DoctorStatusEnum.ACTIVE
    doctor.rating = data.rating
    doctor.totalReviews = data.totalReviews
    doctor.profilePictureUrl = null
    doctor.createdAt = now
    doctor.updatedAt = now
    return doctor
  })

  const savedDoctors = await doctorRepository.save(doctors)
  console.log(`Created ${savedDoctors.length} doctors`)

  const timeSlots: TimeSlotEntity[] = []
  const workDays = [
    DayOfWeekEnum.MONDAY,
    DayOfWeekEnum.TUESDAY,
    DayOfWeekEnum.WEDNESDAY,
    DayOfWeekEnum.THURSDAY,
    DayOfWeekEnum.FRIDAY,
  ]

  for (const doctor of savedDoctors) {
    for (const day of workDays) {
      // Morning slot
      const morningSlot = new TimeSlotEntity()
      morningSlot.doctorId = doctor.id
      morningSlot.dayOfWeek = day
      morningSlot.startTime = '09:00'
      morningSlot.endTime = '12:00'
      morningSlot.slotDurationMinutes = 30
      morningSlot.isAvailable = true
      morningSlot.createdAt = now
      morningSlot.updatedAt = now
      timeSlots.push(morningSlot)

      // Afternoon slot
      const afternoonSlot = new TimeSlotEntity()
      afternoonSlot.doctorId = doctor.id
      afternoonSlot.dayOfWeek = day
      afternoonSlot.startTime = '14:00'
      afternoonSlot.endTime = '17:00'
      afternoonSlot.slotDurationMinutes = 30
      afternoonSlot.isAvailable = true
      afternoonSlot.createdAt = now
      afternoonSlot.updatedAt = now
      timeSlots.push(afternoonSlot)
    }

    // Saturday slot
    const saturdaySlot = new TimeSlotEntity()
    saturdaySlot.doctorId = doctor.id
    saturdaySlot.dayOfWeek = DayOfWeekEnum.SATURDAY
    saturdaySlot.startTime = '10:00'
    saturdaySlot.endTime = '13:00'
    saturdaySlot.slotDurationMinutes = 30
    saturdaySlot.isAvailable = true
    saturdaySlot.createdAt = now
    saturdaySlot.updatedAt = now
    timeSlots.push(saturdaySlot)
  }

  await timeSlotRepository.save(timeSlots)
  console.log(`Created ${timeSlots.length} time slots`)
}
