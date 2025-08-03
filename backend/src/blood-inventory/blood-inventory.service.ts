import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodInventory, BloodGroup } from './entities/blood-inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class BloodInventoryService {
  constructor(
    @InjectRepository(BloodInventory)
    private inventoryRepository: Repository<BloodInventory>,
  ) {}

  async createInventory(createInventoryDto: CreateInventoryDto): Promise<BloodInventory> {
    const existingInventory = await this.inventoryRepository.findOne({
      where: {
        bloodGroup: createInventoryDto.bloodGroup,
        location: createInventoryDto.location
      }
    });

    if (existingInventory) {
      throw new BadRequestException('Inventory for this blood group and location already exists');
    }

    const newInventory = this.inventoryRepository.create({
      ...createInventoryDto,
      expiryDate: new Date(createInventoryDto.expiryDate)
    });

    return this.inventoryRepository.save(newInventory);
  }

  async getAllInventory(): Promise<BloodInventory[]> {
    return this.inventoryRepository.find({
      order: { bloodGroup: 'ASC', location: 'ASC' }
    });
  }

  async getInventoryByBloodGroup(bloodGroup: BloodGroup): Promise<BloodInventory[]> {
    return this.inventoryRepository.find({
      where: { bloodGroup },
      order: { location: 'ASC' }
    });
  }

  async getInventoryByLocation(location: string): Promise<BloodInventory[]> {
    return this.inventoryRepository.find({
      where: { location },
      order: { bloodGroup: 'ASC' }
    });
  }

  async updateInventory(id: number, updateInventoryDto: UpdateInventoryDto): Promise<BloodInventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    
    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    if (updateInventoryDto.expiryDate) {
      updateInventoryDto.expiryDate = new Date(updateInventoryDto.expiryDate) as any;
    }

    Object.assign(inventory, updateInventoryDto);
    return this.inventoryRepository.save(inventory);
  }

  async updateStockLevel(updateStockDto: UpdateStockDto): Promise<BloodInventory[]> {
    const inventoryRecords = await this.inventoryRepository.find({
      where: { bloodGroup: updateStockDto.bloodGroup },
      order: { expiryDate: 'ASC' }
    });

    if (inventoryRecords.length === 0) {
      throw new NotFoundException(`No inventory found for blood group ${updateStockDto.bloodGroup}`);
    }

    let remainingUnits = updateStockDto.unitsToAdd;

    if (remainingUnits > 0) {
      const firstRecord = inventoryRecords[0];
      firstRecord.unitsAvailable += remainingUnits;
      await this.inventoryRepository.save(firstRecord);
    } else {
      const unitsToSubtract = Math.abs(remainingUnits);
      let totalAvailable = inventoryRecords.reduce((sum, record) => sum + record.unitsAvailable, 0);

      if (totalAvailable < unitsToSubtract) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${totalAvailable}, Requested: ${unitsToSubtract}`
        );
      }

      let unitsLeft = unitsToSubtract;
      for (const record of inventoryRecords) {
        if (unitsLeft <= 0) break;

        if (record.unitsAvailable >= unitsLeft) {
          record.unitsAvailable -= unitsLeft;
          unitsLeft = 0;
        } else {
          unitsLeft -= record.unitsAvailable;
          record.unitsAvailable = 0;
        }
        await this.inventoryRepository.save(record);
      }
    }

    return this.getInventoryByBloodGroup(updateStockDto.bloodGroup);
  }

  async deleteInventory(id: number): Promise<void> {
    const result = await this.inventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Inventory record not found');
    }
  }

  async getInventorySummary(): Promise<any> {
    const inventory = await this.getAllInventory();
    
    const summary = inventory.reduce((acc, record) => {
      if (!acc[record.bloodGroup]) {
        acc[record.bloodGroup] = {
          bloodGroup: record.bloodGroup,
          totalUnits: 0,
          locations: []
        };
      }
      acc[record.bloodGroup].totalUnits += record.unitsAvailable;
      acc[record.bloodGroup].locations.push({
        location: record.location,
        units: record.unitsAvailable,
        expiryDate: record.expiryDate
      });
      return acc;
    }, {});

    return Object.values(summary);
  }
}
