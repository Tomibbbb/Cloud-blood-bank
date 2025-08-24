import { Controller, Post, Body, Get, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { BloodRequestsService } from './blood-requests.service';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { CreateDonorBloodRequestDto } from './dto/create-donor-blood-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RequestStatus } from './entities/blood-request.entity';

@Controller('requests')
export class BloodRequestsController {
  constructor(private readonly bloodRequestsService: BloodRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOSPITAL)
  async createRequest(@Body() createBloodRequestDto: CreateBloodRequestDto, @Request() req) {
    const request = await this.bloodRequestsService.createRequest(createBloodRequestDto, req.user.userId);
    return {
      message: 'Blood request created successfully',
      request
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  async getAllRequests(@Request() req) {
    if (req.user.role === UserRole.HOSPITAL) {
      const requests = await this.bloodRequestsService.getRequestsByHospital(req.user.userId);
      return {
        message: 'Hospital blood requests retrieved successfully',
        requests
      };
    }
    
    const requests = await this.bloodRequestsService.getAllRequests();
    return {
      message: 'All blood requests retrieved successfully',
      requests
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateRequestStatus(
    @Param('id') id: number,
    @Body('status') status: RequestStatus
  ) {
    const request = await this.bloodRequestsService.updateRequestStatus(id, status);
    return {
      message: 'Request status updated successfully',
      request
    };
  }

  @Post('donor/request-blood')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DONOR)
  async createDonorBloodRequest(@Body() createDonorBloodRequestDto: CreateDonorBloodRequestDto, @Request() req) {
    const request = await this.bloodRequestsService.createDonorBloodRequest(createDonorBloodRequestDto, req.user.userId);
    return {
      message: 'Blood request created successfully',
      request
    };
  }
}
