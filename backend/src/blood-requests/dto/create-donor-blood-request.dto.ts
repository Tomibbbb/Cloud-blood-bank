import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { BloodGroup } from '../../blood-inventory/entities/blood-inventory.entity';

export class CreateDonorBloodRequestDto {
  @IsNotEmpty()
  @IsEnum(BloodGroup)
  bloodType: BloodGroup;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  units: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  preferredHospitalId?: number;
}