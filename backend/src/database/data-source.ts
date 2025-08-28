import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? {
        rejectUnauthorized: false,
      }
    : process.env.NODE_ENV === 'production'
      ? true
      : false,
  synchronize: false, // Set to false for production with migrations
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  subscribers: ['src/**/*.subscriber{.ts,.js}'],
});

export default AppDataSource;
