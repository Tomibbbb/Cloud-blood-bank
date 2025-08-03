import { IsNotEmpty, IsEnum, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { BloodGroup } from '../entities/blood-inventory.entity';

export class CreateInventoryDto {
  @IsNotEmpty()
  @IsEnum(BloodGroup)
  bloodGroup: BloodGroup;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitsAvailable: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsDateString()
  expiryDate: string;
}