import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { BloodType, DonorStatus } from '../entities/donor.entity';

export class UpdateDonorDto {
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @IsOptional()
  @IsEnum(DonorStatus)
  status?: DonorStatus;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsDateString()
  lastDonationDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDonations?: number;
}
