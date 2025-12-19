# Doctor-Patient Management System - Admin Side

A production-ready NestJS backend application for managing doctors, appointments, and analytics in a hospital management system.

## Features

### Admin Features
- Create doctor credentials
- View all doctors
- Access to analytics dashboard

### Doctor Features
- Login to doctor portal
- Manage time slots (create, view, cancel)
- Create bulk time slots
- View available appointments

### Analytics
- Most booked doctors
- Most booked specialities
- Most booked time slots

### Public API
- Get doctors list with filtering (speciality, experience, search)
- Get available time slots for doctors
- Get doctor details

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus + Terminus
- **Containerization**: Docker + Docker Compose

## Architecture

The application follows a **modular architecture** with clear separation of concerns:

```
src/
├── modules/
│   ├── admin/              # Admin management
│   ├── doctor/             # Doctor management
│   ├── auth/               # Authentication
│   ├── timeSlot/           # Time slot management
│   ├── appointment/        # Appointment tracking
│   ├── analytics/          # Analytics & reporting
│   └── publicApi/          # Public API endpoints
├── common/                 # Shared utilities
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards
│   ├── decorators/        # Custom decorators
│   └── entities/          # Base entities
└── config/                # Configuration files
```

Each module follows the **Domain-Driven Design** pattern:
- `application/`: Controllers, Services, DTOs
- `domain/`: Entities, Repositories, Enums

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (for containerized deployment)
- MySQL 8.0 (if running without Docker)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd doctor-patient-admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Application
PORT=3000
ENVIRONMENT=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=app_user
DB_PASSWORD=app_password
DB_DATABASE=doctor_patient_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### 4. Set up the database

Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d mysql
```

Option B: Manual MySQL setup

```bash
mysql -u root -p < init-db.sql
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Using Docker Compose

```bash
docker-compose up -d
```

The application will be available at:
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/health
- Metrics: http://localhost:3000/metrics

## API Endpoints

### Authentication

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "Admin@123"
}
```

#### Doctor Login
```http
POST /api/auth/doctor/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "Doctor@123"
}
```

### Admin Endpoints (Requires Admin JWT)

#### Create Doctor
```http
POST /api/admin/doctors
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "Doctor@123",
  "name": "Dr. John Doe",
  "speciality": "CARDIOLOGY",
  "phone": "+1234567890",
  "experienceYears": 10
}
```

#### Get All Doctors
```http
GET /api/admin/doctors
Authorization: Bearer <admin-token>
```

#### Get Doctor by ID
```http
GET /api/admin/doctors/:id
Authorization: Bearer <admin-token>
```

### Doctor Endpoints (Requires Doctor JWT)

#### Create Time Slot
```http
POST /api/time-slots
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "slotDate": "2025-12-25",
  "startTime": "09:00",
  "endTime": "09:30"
}
```

#### Create Bulk Time Slots
```http
POST /api/time-slots/bulk
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "timeSlots": [
    {
      "slotDate": "2025-12-25",
      "startTime": "09:00",
      "endTime": "09:30"
    },
    {
      "slotDate": "2025-12-25",
      "startTime": "09:30",
      "endTime": "10:00"
    }
  ]
}
```

#### Get My Time Slots
```http
GET /api/time-slots/my-slots
Authorization: Bearer <doctor-token>
```

#### Cancel Time Slot
```http
DELETE /api/time-slots/:id
Authorization: Bearer <doctor-token>
```

### Analytics Endpoints (Requires Admin JWT)

#### Get All Analytics
```http
GET /api/analytics?limit=10
Authorization: Bearer <admin-token>
```

#### Get Most Booked Doctors
```http
GET /api/analytics/most-booked-doctors?limit=10
Authorization: Bearer <admin-token>
```

#### Get Most Booked Specialities
```http
GET /api/analytics/most-booked-specialities?limit=10
Authorization: Bearer <admin-token>
```

#### Get Most Booked Time Slots
```http
GET /api/analytics/most-booked-timeslots?limit=10
Authorization: Bearer <admin-token>
```

### Public API Endpoints (No Authentication Required)

#### Get Doctors with Filters
```http
GET /api/public/api/doctors?speciality=CARDIOLOGY&experienceYearsMin=5&searchTerm=John
```

#### Get Doctor by ID
```http
GET /api/public/api/doctors/:id
```

#### Get Available Time Slots for a Doctor
```http
GET /api/public/api/doctors/:id/available-slots?startDate=2025-12-20&endDate=2025-12-31
```

#### Get All Available Time Slots
```http
GET /api/public/api/available-slots?startDate=2025-12-20&endDate=2025-12-31
```

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### CI Tests
```bash
npm run test:ci
npm run test:e2e:ci
```

## Code Quality

### Linting
```bash
npm run lint
npm run lint:ci
```

### Formatting
```bash
npm run format
npm run format:ci
```

## Docker

### Build Image
```bash
docker build -t doctor-patient-admin:latest .
```

### Run Container
```bash
docker run -p 3000:3000 --env-file .env doctor-patient-admin:latest
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Prometheus Metrics
```bash
curl http://localhost:3000/metrics
```

## Database Schema

See `init-db.sql` for the complete database schema.

### Tables
- `admins`: Admin user accounts
- `doctors`: Doctor profiles
- `time_slots`: Doctor availability slots
- `appointments`: Patient appointments (for analytics)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `ENVIRONMENT` | Environment (development/production) | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USERNAME` | Database username | `app_user` |
| `DB_PASSWORD` | Database password | `app_password` |
| `DB_DATABASE` | Database name | `doctor_patient_db` |
| `DB_SYNCHRONIZE` | Auto sync schema (dev only) | `false` |
| `DB_LOGGING` | Enable SQL logging | `false` |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |

## Best Practices Implemented

- ✅ Modular architecture with clear separation of concerns
- ✅ Repository pattern for data access
- ✅ Service layer for business logic
- ✅ DTOs with validation
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Global exception handling
- ✅ Docker containerization
- ✅ Health checks
- ✅ Prometheus metrics
- ✅ Swagger documentation
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Proper logging

## Project Structure Conventions

Following QuestionPro coding standards:
- Modules use camelCase naming
- Each module has `application/` and `domain/` layers
- Controllers are thin, services contain business logic
- Repositories handle all database queries
- DTOs for request/response validation
- Enums for type safety

## License

UNLICENSED - Private/Internal Use Only

## Support

For issues and questions, please contact the development team.
