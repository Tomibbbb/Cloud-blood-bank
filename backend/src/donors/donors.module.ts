import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';
import { Donor } from './entities/donor.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donor, User])],
  providers: [DonorsService],
  controllers: [DonorsController],
  exports: [DonorsService]
})
export class DonorsModule {}
