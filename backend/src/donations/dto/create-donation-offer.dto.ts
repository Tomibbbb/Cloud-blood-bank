import { IsString, IsDateString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateDonationOfferDto {
  @IsString()
  @IsNotEmpty()
  bloodType: string;

  @IsDateString()
  preferredDate: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  notes?: string;
}