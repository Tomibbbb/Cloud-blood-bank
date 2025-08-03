import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { Donor } from '../../donors/entities/donor.entity';
import { BloodInventory } from '../../blood-inventory/entities/blood-inventory.entity';
import { BloodRequest } from '../../blood-requests/entities/blood-request.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Donor, BloodInventory, BloodRequest]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}