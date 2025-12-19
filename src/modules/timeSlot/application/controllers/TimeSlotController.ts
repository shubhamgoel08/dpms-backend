import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TimeSlotService } from '../services/TimeSlotService';
import { CreateTimeSlotDto } from '../dtos/CreateTimeSlotDto';
import { CreateBulkTimeSlotsDto } from '../dtos/CreateBulkTimeSlotsDto';
import { TimeSlotEntity } from '../../domain/entities/TimeSlotEntity';
import { JwtAuthGuard } from '../../../../common/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../common/guards/RolesGuard';
import { Roles } from '../../../../common/decorators/Roles.decorator';
import { CurrentUser } from '../../../../common/decorators/CurrentUser.decorator';
import { UserRoleEnum } from '../../../auth/domain/enums/UserRoleEnum';

@Controller('time-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.DOCTOR)
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  async createTimeSlot(
    @Body() createTimeSlotDto: CreateTimeSlotDto,
    @CurrentUser() user: any,
  ): Promise<TimeSlotEntity> {
    return this.timeSlotService.createTimeSlot(user.id, createTimeSlotDto);
  }

  @Post('bulk')
  async createBulkTimeSlots(
    @Body() createBulkTimeSlotsDto: CreateBulkTimeSlotsDto,
    @CurrentUser() user: any,
  ): Promise<TimeSlotEntity[]> {
    return this.timeSlotService.createBulkTimeSlots(
      user.id,
      createBulkTimeSlotsDto,
    );
  }

  @Get('my-slots')
  async getMyTimeSlots(@CurrentUser() user: any): Promise<TimeSlotEntity[]> {
    return this.timeSlotService.getDoctorTimeSlots(user.id);
  }

  @Get('available')
  async getAvailableTimeSlots(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimeSlotEntity[]> {
    return this.timeSlotService.getAvailableTimeSlots(
      user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Delete(':id')
  async cancelTimeSlot(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.timeSlotService.cancelTimeSlot(id, user.id);
    return { message: 'Time slot cancelled successfully' };
  }
}
