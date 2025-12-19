import * as request from 'supertest'

import {createTestApp, closeTestApp, ITestApp} from '../testAppHelper'

/**
 * E2E Tests for AuthService
 *
 * Tests complete authentication flows including:
 * - Patient registration
 * - Patient login
 * - JWT token validation
 *
 * Uses Testcontainers for a real MySQL database.
 */
describe('AuthService (e2e)', () => {
  let testApp: ITestApp

  beforeAll(async () => {
    testApp = await createTestApp()
  }, 120000) // 2 minutes timeout for container startup

  afterAll(async () => {
    await closeTestApp(testApp)
  })

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'test.patient@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    }

    it('should register a new patient and return JWT token', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201)

      // Verify response structure
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('tokenType', 'Bearer')
      expect(response.body).toHaveProperty('expiresIn')
      expect(response.body).toHaveProperty('user')

      // Verify user data
      expect(response.body.user.email).toBe(validRegistrationData.email)
      expect(response.body.user.firstName).toBe(validRegistrationData.firstName)
      expect(response.body.user.lastName).toBe(validRegistrationData.lastName)

      // Verify password is not returned
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return 400 when email already exists', async () => {
      // Register first patient
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'duplicate@example.com',
        })
        .expect(201)

      // Try to register with same email
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'duplicate@example.com',
        })
        .expect(400)

      expect(response.body.message).toContain('already registered')
    })

    it('should return 400 when required fields are missing', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
          // Missing password, firstName, lastName
        })
        .expect(400)

      expect(response.body).toHaveProperty('message')
    })

    it('should return 400 when email format is invalid', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email',
        })
        .expect(400)
    })
  })

  describe('POST /api/auth/login', () => {
    const registeredUser = {
      email: 'login.test@example.com',
      password: 'LoginPass123!',
      firstName: 'Jane',
      lastName: 'Smith',
    }

    beforeAll(async () => {
      // Register a user for login tests
      await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send(registeredUser)
    })

    it('should login with valid credentials and return JWT token', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registeredUser.email,
          password: registeredUser.password,
        })
        .expect(201)

      // Verify response structure
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('tokenType', 'Bearer')
      expect(response.body.user.email).toBe(registeredUser.email)
    })

    it('should return 401 with invalid password', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registeredUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401)

      expect(response.body.message).toContain('Invalid email or password')
    })

    it('should return 401 with non-existent email', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401)

      expect(response.body.message).toContain('Invalid email or password')
    })
  })

  describe('Protected Routes', () => {
    let authToken: string

    beforeAll(async () => {
      // Register and get token
      const response = await request(testApp.app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'protected.test@example.com',
          password: 'ProtectedPass123!',
          firstName: 'Protected',
          lastName: 'User',
        })

      authToken = response.body.accessToken
    })

    it('should access protected route with valid token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/patient/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
    })

    it('should return 401 without token', async () => {
      await request(testApp.app.getHttpServer()).get('/api/patient/profile').expect(401)
    })

    it('should return 401 with invalid token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/patient/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })
})
