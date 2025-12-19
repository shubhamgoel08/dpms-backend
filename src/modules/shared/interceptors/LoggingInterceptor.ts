import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {PerformanceLogStore} from '../performanceLog/PerformanceLogStore'
import {PerformanceLogEntity} from '../entities/PerformanceLogEntity'
import {QueryLoggingService} from '../services/QueryLoggingService'
import {Request, Response} from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private queryLoggingService: QueryLoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>()
    const requestPayloadSize = req?.body ? JSON.stringify(req.body).length : 0

    const method = req.method
    const path = req.url
    const now = Date.now()

    return next.handle().pipe(
      map(data => {
        const store = PerformanceLogStore.get()
        if (data && store) {
          const requestDuration = Date.now() - now
          const queries = store.queries
          const queryCount = queries.length
          const res = context.switchToHttp().getResponse<Response>()
          const status = res.statusCode

          const responsePayloadSize = data ? JSON.stringify(data).length : 0
          const payloadSize = requestPayloadSize + responsePayloadSize

          if (queries.length > 0) {
            const performanceLogEntity = PerformanceLogEntity.create(
              path,
              method,
              status,
              requestDuration,
              queryCount,
              queries,
              payloadSize,
            )
            this.queryLoggingService.addToQueue(performanceLogEntity)
          }
        }

        return data
      }),
    )
  }
}

