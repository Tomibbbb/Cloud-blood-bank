import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { BloodGroup } from '../entities/blood-inventory.entity';

export class UpdateStockDto {
  @IsNotEmpty()
  @IsEnum(BloodGroup)
  bloodGroup: BloodGroup;

  @IsNotEmpty()
  @IsNumber()
  unitsToAdd: number; // Positive to add, negative to subtract
}
