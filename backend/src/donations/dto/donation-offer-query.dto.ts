import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { DonationOfferStatus } from '../entities/donation-offer.entity';

export class DonationOfferQueryDto {
  @IsOptional()
  @IsEnum(DonationOfferStatus)
  status?: DonationOfferStatus;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  hospitalId?: string;
}