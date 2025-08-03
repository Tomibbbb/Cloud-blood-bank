import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodRequestsService } from './blood-requests.service';
import { BloodRequestsController } from './blood-requests.controller';
import { BloodRequest } from './entities/blood-request.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloodRequest, User])],
  providers: [BloodRequestsService],
  controllers: [BloodRequestsController],
  exports: [BloodRequestsService]
})
export class BloodRequestsModule {}
