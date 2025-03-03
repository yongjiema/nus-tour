import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './database/entities/user.entity';
import { Booking } from './database/entities/booking.entity';
import { ConfigModule } from '@nestjs/config';

// Initialize ConfigService
ConfigModule.forRoot();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  ssl: {
    rejectUnauthorized: false
  },
  database: configService.get('DB_NAME', 'nus_tour'),
  username: configService.get('DB_USER', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  entities: [User, Booking],
  synchronize: true, // Enable synchronize for development
  logging: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
