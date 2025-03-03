import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingManagementModule } from './admin/bookingManagement/booking.module';
import { User } from './database/entities/user.entity';
import { Booking } from './database/entities/booking.entity';
import { Payment } from './database/entities/payments.entity';
import { CheckinModule } from './checkin/checkin.module';
import config from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...config,
      entities: [User, Booking, Payment],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([Booking]),
    BookingModule,
    PaymentsModule,
    BookingManagementModule,
    CheckinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
