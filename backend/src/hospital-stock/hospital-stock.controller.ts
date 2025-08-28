import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  UseGuards,
  Param,
  Request,
} from '@nestjs/common';
import { HospitalStockService } from './hospital-stock.service';
import { CreateHospitalStockDto } from './dto/create-hospital-stock.dto';
import { UpdateHospitalStockDto } from './dto/update-hospital-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('hospital-stock')
export class HospitalStockController {
  constructor(private readonly hospitalStockService: HospitalStockService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOSPITAL)
  async createStock(
    @Body() createStockDto: CreateHospitalStockDto,
    @Request() req,
  ) {
    const hospitalId = req.user.id;
    const stock = await this.hospitalStockService.createStock(
      createStockDto,
      hospitalId,
    );
    return {
      message: 'Hospital stock record created successfully',
      stock,
    };
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOSPITAL)
  async getDashboardStats(@Request() req) {
    const hospitalId = req.user.id;
    const stats = await this.hospitalStockService.getDashboardStats(hospitalId);
    return {
      message: 'Dashboard statistics retrieved successfully',
      ...stats,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOSPITAL)
  async getHospitalStock(@Request() req) {
    const hospitalId = req.user.id;
    const stocks = await this.hospitalStockService.getHospitalStock(hospitalId);
    return {
      message: 'Hospital stock retrieved successfully',
      stocks,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOSPITAL)
  async updateStock(
    @Param('id') id: number,
    @Body() updateStockDto: UpdateHospitalStockDto,
    @Request() req,
  ) {
    const hospitalId = req.user.id;
    const stock = await this.hospitalStockService.updateStock(
      id,
      updateStockDto,
      hospitalId,
    );
    return {
      message: 'Hospital stock record updated successfully',
      stock,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOSPITAL)
  async deleteStock(@Param('id') id: number, @Request() req) {
    const hospitalId = req.user.id;
    await this.hospitalStockService.deleteStock(id, hospitalId);
    return {
      message: 'Hospital stock record deleted successfully',
    };
  }
}
