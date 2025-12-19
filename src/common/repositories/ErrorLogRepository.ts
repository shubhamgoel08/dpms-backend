import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { ErrorLogEntity } from '../entities/ErrorLogEntity';

export const errorLogRepositoryProvider = {
  provide: 'ERROR_LOG_REPOSITORY',
  useFactory: (dataSource: DataSource): Repository<ErrorLogEntity> =>
    dataSource.getRepository(ErrorLogEntity),
  inject: ['DATA_SOURCE'],
};

@Injectable()
export class ErrorLogRepository {
  constructor(
    @Inject('ERROR_LOG_REPOSITORY')
    private errorLogRepository: Repository<ErrorLogEntity>,
  ) {}

  async save(errorLogEntity: ErrorLogEntity): Promise<ErrorLogEntity> {
    return await this.errorLogRepository.save(errorLogEntity);
  }

  async findAll(limit: number = 100): Promise<ErrorLogEntity[]> {
    return await this.errorLogRepository
      .createQueryBuilder('error_log')
      .orderBy('error_log.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findById(id: number): Promise<ErrorLogEntity | null> {
    return await this.errorLogRepository
      .createQueryBuilder('error_log')
      .where('error_log.id = :id', { id })
      .getOne();
  }
}
