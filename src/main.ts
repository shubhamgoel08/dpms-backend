import {NestFactory} from '@nestjs/core'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import {Logger} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

import {AppModule} from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('port') ?? 3000

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  setupSwagger(app)

  await app.listen(port)

  logger.log(`Application running on: http://localhost:${port}`)
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`)
  logger.log(`Health check: http://localhost:${port}/api/health`)
}

function setupSwagger(app: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never) {
  const config = new DocumentBuilder()
    .setTitle('Doctor-Patient Management API')
    .setDescription('API for managing patient appointments with doctors')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'Patient registration and login')
    .addTag('Patient', 'Patient profile management')
    .addTag('Doctors', 'Doctor search and information')
    .addTag('Appointments', 'Appointment booking and management')
    .addTag('Health', 'Application health status')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
}

bootstrap()
