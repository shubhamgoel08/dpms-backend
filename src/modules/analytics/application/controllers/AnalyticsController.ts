import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService, AnalyticsData } from '../services/AnalyticsService';
import { JwtAuthGuard } from '../../../../common/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../common/guards/RolesGuard';
import { Roles } from '../../../../common/decorators/Roles.decorator';
import { UserRoleEnum } from '../../../auth/domain/enums/UserRoleEnum';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<AnalyticsData> {
    return this.analyticsService.getAnalytics(limit || 10);
  }

  @Get('most-booked-doctors')
  async getMostBookedDoctors(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.analyticsService.getMostBookedDoctors(limit || 10);
  }

  @Get('most-booked-specialities')
  async getMostBookedSpecialities(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.analyticsService.getMostBookedSpecialities(limit || 10);
  }

  @Get('most-booked-timeslots')
  async getMostBookedTimeSlots(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.analyticsService.getMostBookedTimeSlots(limit || 10);
  }
}
