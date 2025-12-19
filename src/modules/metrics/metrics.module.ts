import {Module} from '@nestjs/common'
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus'

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    }),
    makeCounterProvider({
      name: 'appointments_total',
      help: 'Total number of appointments',
      labelNames: ['status'],
    }),
    makeCounterProvider({
      name: 'patient_registrations_total',
      help: 'Total number of patient registrations',
    }),
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}

