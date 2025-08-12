import { IsEnum, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { BloodType } from '../entities/hospital-stock.entity';

export class CreateHospitalStockDto {
  @IsEnum(BloodType)
  bloodType: BloodType;

  @IsInt()
  @Min(1)
  unitsAvailable: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}