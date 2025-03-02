import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
import config from '../ormconfig';
import { InformationModule } from './information/information.module';
import { Information } from './database/entities/information.entity';
import { TourInformationModule } from './tourinformation/tourinformation.module';
import { TourInformation } from './database/entities/tourinformation.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...config,
      entities: [Booking, Payment, Information /* ... other entities */],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Booking, Information]), // Add Information entity here
    DatabaseModule,
    AuthModule,
    UsersModule,
    BookingModule,
    PaymentsModule,
    CheckinModule,
    InformationModule,
    TourInformationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}