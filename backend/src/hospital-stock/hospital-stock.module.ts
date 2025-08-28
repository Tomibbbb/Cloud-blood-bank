import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalStockController } from './hospital-stock.controller';
import { HospitalStockService } from './hospital-stock.service';
import { HospitalStock } from './entities/hospital-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HospitalStock])],
  controllers: [HospitalStockController],
  providers: [HospitalStockService],
  exports: [HospitalStockService],
})
export class HospitalStockModule {}
