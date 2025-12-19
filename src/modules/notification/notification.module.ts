import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {NotificationService} from './application/services/NotificationService'

@Module({
  imports: [ConfigModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

