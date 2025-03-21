import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService, } from '@nestjs/config';
import { AppController,DashboardController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { Booking } from './database/entities/booking.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './database/entities/payments.entity';
import { BookingManagementModule } from './admin/bookingManagement/booking.module';
import { CheckinModule } from './checkin/checkin.module';
import { InformationModule } from './information/information.module';
import { Information } from './database/entities/information.entity';
import { TourInformationModule } from './tourinformation/tourinformation.module';
import { TourInformation } from './database/entities/tourinformation.entity';
import { User } from './database/entities/user.entity';
import { NewsEventModule } from './news-event/news-event.module';
import { NewsEvent } from './database/entities/news-event.entity';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';
import config from '../ormconfig';

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
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    BookingModule,
    PaymentsModule,
    BookingManagementModule,
    CheckinModule,
    InformationModule,
    TourInformationModule,
    NewsEventModule,
    FeedbackModule,
    DashboardModule,
  ],
  controllers: [AppController, DashboardController],
  providers: [AppService],
})
export class AppModule {}