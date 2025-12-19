import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {PerformanceLogEntity} from '../entities/PerformanceLogEntity'

@Injectable()
export class QueryLoggingService {
  private readonly logger = new Logger(QueryLoggingService.name)
  private readonly queue: PerformanceLogEntity[] = []
  private isProcessing = false

  constructor(
    @InjectRepository(PerformanceLogEntity)
    private readonly performanceLogRepository: Repository<PerformanceLogEntity>,
  ) {
    this.startProcessing()
  }

  addToQueue(entity: PerformanceLogEntity): void {
    this.queue.push(entity)
  }

  private startProcessing(): void {
    setInterval(() => {
      this.processQueue()
    }, 5000)
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      const entities = this.queue.splice(0, 100)
      await this.performanceLogRepository.save(entities)
    } catch (error) {
      this.logger.error('Failed to save performance logs', error)
    } finally {
      this.isProcessing = false
    }
  }
}

