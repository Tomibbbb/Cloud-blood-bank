import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HospitalStock } from './entities/hospital-stock.entity';
import { CreateHospitalStockDto } from './dto/create-hospital-stock.dto';
import { UpdateHospitalStockDto } from './dto/update-hospital-stock.dto';

@Injectable()
export class HospitalStockService {
  constructor(
    @InjectRepository(HospitalStock)
    private hospitalStockRepository: Repository<HospitalStock>,
  ) {}

  async createStock(
    createStockDto: CreateHospitalStockDto,
    hospitalId: number,
  ): Promise<HospitalStock> {
    const stock = this.hospitalStockRepository.create({
      ...createStockDto,
      hospitalId,
    });

    return await this.hospitalStockRepository.save(stock);
  }

  async getHospitalStock(hospitalId: number): Promise<HospitalStock[]> {
    return await this.hospitalStockRepository.find({
      where: { hospitalId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStock(
    id: number,
    updateStockDto: UpdateHospitalStockDto,
    hospitalId: number,
  ): Promise<HospitalStock> {
    const stock = await this.hospitalStockRepository.findOne({
      where: { id },
    });

    if (!stock) {
      throw new NotFoundException('Hospital stock record not found');
    }

    if (stock.hospitalId !== hospitalId) {
      throw new ForbiddenException(
        'You can only update your own hospital stock records',
      );
    }

    Object.assign(stock, updateStockDto);
    return await this.hospitalStockRepository.save(stock);
  }

  async deleteStock(id: number, hospitalId: number): Promise<void> {
    const stock = await this.hospitalStockRepository.findOne({
      where: { id },
    });

    if (!stock) {
      throw new NotFoundException('Hospital stock record not found');
    }

    if (stock.hospitalId !== hospitalId) {
      throw new ForbiddenException(
        'You can only delete your own hospital stock records',
      );
    }

    await this.hospitalStockRepository.remove(stock);
  }

  async getDashboardStats(hospitalId: number) {
    const stocks = await this.hospitalStockRepository.find({
      where: { hospitalId },
    });

    const totalBloodUnits = stocks.reduce(
      (sum, stock) => sum + stock.unitsAvailable,
      0,
    );

    const bloodTypesAvailable = new Set(stocks.map((stock) => stock.bloodType))
      .size;

    const expiringSoon = stocks.filter((stock) => {
      if (!stock.expiryDate) return false;
      const expiry = new Date(stock.expiryDate);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    const criticalStock = stocks.filter(
      (stock) => stock.unitsAvailable < 5,
    ).length;

    const pendingRequests = 0; // This should be fetched from blood requests table

    return {
      totalBloodUnits,
      bloodTypesAvailable,
      pendingRequests,
      criticalStock,
      expiringSoon,
      stockDetails: stocks.map((stock) => ({
        bloodType: stock.bloodType,
        unitsAvailable: stock.unitsAvailable,
        expiryDate: stock.expiryDate,
        isExpiringSoon: stock.expiryDate
          ? (() => {
              const expiry = new Date(stock.expiryDate);
              const today = new Date();
              const diffTime = expiry.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7 && diffDays >= 0;
            })()
          : false,
        isCritical: stock.unitsAvailable < 5,
      })),
    };
  }
}
