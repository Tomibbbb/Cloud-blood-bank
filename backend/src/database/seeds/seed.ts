import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  console.log('🚀 Initializing database seeding...');
  
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
    })
  );

  const seedService = app.get(SeedService);
  
  try {
    await seedService.seed();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();