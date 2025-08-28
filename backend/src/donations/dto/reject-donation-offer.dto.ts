import { IsString, IsNotEmpty } from 'class-validator';

export class RejectDonationOfferDto {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}
