import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationOffersController } from './donation-offers.controller';
import { DonationOffersService } from './donation-offers.service';
import { OfferRoutingService } from './utils/routing.util';
import { DonationOffer } from './entities/donation-offer.entity';
import { User } from '../users/entities/user.entity';
import { BloodInventory } from '../blood-inventory/entities/blood-inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonationOffer, User, BloodInventory])],
  controllers: [DonationOffersController],
  providers: [DonationOffersService, OfferRoutingService],
  exports: [DonationOffersService],
})
export class DonationOffersModule {}
