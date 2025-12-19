import {DataSource} from 'typeorm'
import {config} from 'dotenv'
import {seedDoctors} from './SeedData'

import {PatientEntity} from '../../modules/patient/domain/entities/PatientEntity'
import {DoctorEntity} from '../../modules/doctor/domain/entities/DoctorEntity'
import {TimeSlotEntity} from '../../modules/doctor/domain/entities/TimeSlotEntity'
import {AppointmentEntity} from '../../modules/appointment/domain/entities/AppointmentEntity'
import {ErrorLogEntity} from '../../modules/shared/entities/ErrorLogEntity'
import {PerformanceLogEntity} from '../../modules/shared/entities/PerformanceLogEntity'

config()

const dataSource = new DataSource({
  type: 'mysql',
  socketPath: '/tmp/mysql.sock',
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'doctor_patient_db',
  entities: [
    PatientEntity,
    DoctorEntity,
    TimeSlotEntity,
    AppointmentEntity,
    ErrorLogEntity,
    PerformanceLogEntity,
  ],
  synchronize: false,
})

async function seed() {
  try {
    console.log('Connecting to database...')
    await dataSource.initialize()
    console.log('Connected!')

    console.log('Seeding doctors...')
    await seedDoctors(dataSource)
    console.log('Doctors seeded successfully!')

    await dataSource.destroy()
    console.log('Done!')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
