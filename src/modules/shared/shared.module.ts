import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {ResponseService} from './response/ResponseService'
import {ErrorLogService} from './services/ErrorLogService'
import {QueryLoggingService} from './services/QueryLoggingService'
import {ErrorLogEntity} from './entities/ErrorLogEntity'
import {PerformanceLogEntity} from './entities/PerformanceLogEntity'

@Module({
  imports: [TypeOrmModule.forFeature([ErrorLogEntity, PerformanceLogEntity])],
  providers: [ResponseService, ErrorLogService, QueryLoggingService],
  exports: [ResponseService, ErrorLogService, QueryLoggingService],
})
export class SharedModule {}

