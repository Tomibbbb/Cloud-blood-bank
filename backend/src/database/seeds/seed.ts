import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  

  const app = await NestFactory.create(
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({ isGlobal: true }), SeedModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: true, // Enable for seeding to create tables if needed
      }),
    }),
  );

  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
