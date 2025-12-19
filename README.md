# Doctor-Patient Management System - Client Side

A comprehensive NestJS-based backend application for managing doctor-patient appointments. This application follows industry-standard coding practices and architectural patterns.

## Features

### Patient Features
- **Registration & Authentication**: Secure patient registration with JWT-based authentication
- **Profile Management**: View and update patient profile information
- **Doctor Search**: Search and filter doctors by:
  - Specialty
  - City/State
  - Experience years
  - Consultation fee
  - Rating
  - Available time slots
- **Appointment Booking**: Book appointments with doctors
- **Appointment Management**: View, track, and cancel appointments
- **Email Notifications**: Doctors receive email notifications for confirmed appointments

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: MySQL 8.x with TypeORM
- **Authentication**: JWT with Passport.js
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus metrics + Health checks (Terminus)
- **Containerization**: Docker & Docker Compose

## Project Structure

```
src/
├── config/                    # Configuration files
├── modules/
│   ├── appointment/           # Appointment booking module
│   │   ├── application/
│   │   │   ├── controllers/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   └── domain/
│   │       ├── entities/
│   │       ├── enums/
│   │       └── repositories/
│   ├── auth/                  # Authentication module
│   │   └── application/
│   │       ├── controllers/
│   │       ├── dtos/
│   │       ├── guards/
│   │       ├── services/
│   │       └── strategies/
│   ├── database/              # Database configuration
│   ├── doctor/                # Doctor search module
│   │   ├── application/
│   │   │   ├── controllers/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   └── domain/
│   │       ├── entities/
│   │       ├── enums/
│   │       └── repositories/
│   ├── health/                # Health check endpoints
│   ├── metrics/               # Prometheus metrics
│   ├── notification/          # Email notification service
│   ├── patient/               # Patient management module
│   │   ├── application/
│   │   │   ├── controllers/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   └── domain/
│   │       ├── entities/
│   │       ├── enums/
│   │       └── repositories/
│   └── shared/                # Shared utilities
│       ├── entities/
│       ├── filters/
│       ├── interceptors/
│       ├── performanceLog/
│       ├── response/
│       ├── services/
│       └── validation/
├── tests/                     # E2E tests
│   ├── appointment/
│   ├── auth/
│   ├── doctor/
│   └── helpers/
├── app.module.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose (for containerized setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doctor-patient-management
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration.

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Running Locally

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new patient
- `POST /api/auth/login` - Login and get JWT token

#### Patient
- `GET /api/patient/profile` - Get current patient profile
- `PUT /api/patient/profile` - Update patient profile

#### Doctors
- `GET /api/doctors` - Search/filter doctors
- `GET /api/doctors/specialties` - Get all specialties
- `GET /api/doctors/specialties/available` - Get specialties with active doctors
- `GET /api/doctors/specialty/:specialty` - Get doctors by specialty
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/:id/time-slots` - Get doctor's available time slots
- `GET /api/doctors/:id/time-slots/:dayOfWeek` - Get time slots for specific day

#### Appointments
- `POST /api/appointments` - Book an appointment
- `GET /api/appointments` - Get all patient appointments
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/past` - Get past appointments
- `GET /api/appointments/available-slots` - Get available slots for a doctor
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id/cancel` - Cancel an appointment

#### Health & Monitoring
- `GET /api/health` - Health check endpoint
- `GET /metrics` - Prometheus metrics

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# CI tests
npm run test:ci
npm run test:e2e:ci
```

## Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format

# CI checks
npm run lint:ci
npm run format:ci
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| APP_PORT | Application port | 3000 |
| DATABASE_HOST | MySQL host | localhost |
| DATABASE_PORT | MySQL port | 3306 |
| DATABASE_USERNAME | MySQL username | - |
| DATABASE_PASSWORD | MySQL password | - |
| DATABASE_NAME | Database name | doctor_patient_db |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRATION | JWT token expiration | 1d |
| MAIL_HOST | SMTP host | - |
| MAIL_PORT | SMTP port | 587 |
| MAIL_USER | SMTP username | - |
| MAIL_PASSWORD | SMTP password | - |
| MAIL_FROM | From email address | - |
| METRICS_PORT | Prometheus metrics port | 9090 |

## Architecture Highlights

### Following QuestionPro Backend Rules

1. **Module Structure**: Each feature has its own module with:
   - `application/` layer (controllers, services, DTOs)
   - `domain/` layer (entities, repositories, enums)

2. **Dependency Management**: 
   - Services expose module functionality
   - Inter-module communication through exported services only

3. **Error Handling**:
   - Global exception filter (`AllExceptionsFilter`)
   - Errors logged to database
   - Validation errors handled separately

4. **Performance Monitoring**:
   - AsyncLocalStorage for request-scoped query tracking
   - Logging interceptor for performance metrics
   - Prometheus metrics for monitoring

5. **Docker Containerization**:
   - Multi-stage builds
   - Health checks
   - Volume mounts for logs

6. **Testing**:
   - E2E tests with Testcontainers
   - Unit tests for pure algorithmic logic

## License

UNLICENSED

