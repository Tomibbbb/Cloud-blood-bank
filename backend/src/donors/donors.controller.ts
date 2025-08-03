import { Controller, Post, Body, Get, Put, Param, UseGuards } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DONOR)
  async registerDonor(@Body() createDonorDto: CreateDonorDto) {
    const result = await this.donorsService.registerDonor(createDonorDto);
    return {
      message: 'Donor registered successfully',
      donor: result.donor,
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role
      }
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  async getAllDonors() {
    const donors = await this.donorsService.getAllDonors();
    return {
      message: 'Donors retrieved successfully',
      donors
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DONOR, UserRole.ADMIN, UserRole.HOSPITAL)
  async getDonorById(@Param('id') id: number) {
    const donor = await this.donorsService.findDonorById(id);
    return {
      message: 'Donor retrieved successfully',
      donor
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DONOR, UserRole.ADMIN)
  async updateDonor(@Param('id') id: number, @Body() updateDonorDto: UpdateDonorDto) {
    const donor = await this.donorsService.updateDonor(id, updateDonorDto);
    return {
      message: 'Donor updated successfully',
      donor
    };
  }
}
