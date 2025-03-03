import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot(), // Ensure environment variables are loaded
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        ssl: { rejectUnauthorized: false },
        database: configService.get('DB_NAME', 'nus_tour'),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        entities: [User, Booking],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
