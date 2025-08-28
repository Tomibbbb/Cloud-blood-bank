import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DonorsModule } from './donors/donors.module';
import { BloodRequestsModule } from './blood-requests/blood-requests.module';
import { BloodInventoryModule } from './blood-inventory/blood-inventory.module';
import { HospitalStockModule } from './hospital-stock/hospital-stock.module';
import { DonationOffersModule } from './donations/donation-offers.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const needsSSL =
          databaseUrl?.includes('sslmode=require') ||
          (process.env.NODE_ENV === 'production' &&
            !databaseUrl?.includes('localhost'));

        return {
          type: 'postgres',
          url: databaseUrl,
          ssl: needsSSL ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: true, // Temporarily enabled to create schema
          logging: process.env.NODE_ENV === 'development',
        };
      },
    }),
    UsersModule,
    AuthModule,
    DonorsModule,
    BloodRequestsModule,
    BloodInventoryModule,
    HospitalStockModule,
    DonationOffersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
