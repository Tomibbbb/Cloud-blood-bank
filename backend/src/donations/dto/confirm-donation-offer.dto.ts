import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ConfirmDonationOfferDto {
  @IsDateString()
  appointmentDate: string;

  @IsOptional()
  @IsString()
  hospitalNotes?: string;
}