import { Controller, Post, Body, Get, Put, Delete, UseGuards, Param, Query, Patch } from '@nestjs/common';
import { BloodInventoryService } from './blood-inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BloodGroup } from './entities/blood-inventory.entity';

@Controller('inventory')
export class BloodInventoryController {
  constructor(private readonly inventoryService: BloodInventoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createInventory(@Body() createInventoryDto: CreateInventoryDto) {
    const inventory = await this.inventoryService.createInventory(createInventoryDto);
    return {
      message: 'Inventory record created successfully',
      inventory
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllInventory() {
    const inventory = await this.inventoryService.getAllInventory();
    return {
      message: 'Inventory retrieved successfully',
      inventory
    };
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getInventorySummary() {
    const summary = await this.inventoryService.getInventorySummary();
    return {
      message: 'Inventory summary retrieved successfully',
      summary
    };
  }

  @Get('blood-group/:bloodGroup')
  @UseGuards(JwtAuthGuard)
  async getInventoryByBloodGroup(@Param('bloodGroup') bloodGroup: BloodGroup) {
    const inventory = await this.inventoryService.getInventoryByBloodGroup(bloodGroup);
    return {
      message: `Inventory for ${bloodGroup} retrieved successfully`,
      inventory
    };
  }

  @Get('location')
  @UseGuards(JwtAuthGuard)
  async getInventoryByLocation(@Query('location') location: string) {
    const inventory = await this.inventoryService.getInventoryByLocation(location);
    return {
      message: `Inventory for location ${location} retrieved successfully`,
      inventory
    };
  }

  @Patch('stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStockLevel(@Body() updateStockDto: UpdateStockDto) {
    const inventory = await this.inventoryService.updateStockLevel(updateStockDto);
    return {
      message: `Stock level updated for ${updateStockDto.bloodGroup}`,
      inventory
    };
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateInventoryGeneric(@Body() updateStockDto: UpdateStockDto) {
    const inventory = await this.inventoryService.updateStockLevel(updateStockDto);
    return {
      message: `Inventory updated for ${updateStockDto.bloodGroup}`,
      inventory
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateInventory(
    @Param('id') id: number,
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    const inventory = await this.inventoryService.updateInventory(id, updateInventoryDto);
    return {
      message: 'Inventory record updated successfully',
      inventory
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteInventory(@Param('id') id: number) {
    await this.inventoryService.deleteInventory(id);
    return {
      message: 'Inventory record deleted successfully'
    };
  }
}
