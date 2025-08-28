import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { BloodGroup } from '../../blood-inventory/entities/blood-inventory.entity';

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateBloodRequestDto {
  @IsNotEmpty()
  @IsEnum(BloodGroup)
  bloodType: BloodGroup;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsEnum(Priority)
  urgency: Priority;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  patientName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  patientAge: number;

  @IsNotEmpty()
  @IsDateString()
  requiredBy: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
