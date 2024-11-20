import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from '../database/entities/payments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
