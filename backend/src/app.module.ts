import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingModule } from './booking/booking.module';
import { PaymentsModule } from './payments/payments.module';
import { Booking } from './database/entities/booking.entity';
import { Payment } from './database/entities/payments.entity';
import { CheckinModule } from './checkin/checkin.module';
import { InformationModule } from './information/information.module';
import { Information } from './database/entities/information.entity';
import { TourInformationModule } from './tourinformation/tourinformation.module';
import { TourInformation } from './database/entities/tourinformation.entity';
import { User } from './database/entities/user.entity';
import { NewsEventModule } from './news-event/news-event.module';
import { NewsEvent } from './database/entities/news-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      entities: [User, Booking, Payment, Information, TourInformation, NewsEvent],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Booking, Information]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BookingModule,
    PaymentsModule,
    CheckinModule,
    InformationModule,
    TourInformationModule,
    NewsEventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}