import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../database/entities/payments.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async createPayment(bookingId: string, amount: number): Promise<Payment> {
    const payment = this.paymentsRepository.create({ bookingId, amount });
    return this.paymentsRepository.save(payment);
  }

  async confirmPayment(bookingId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { bookingId } });
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.status = 'Paid';
    return this.paymentsRepository.save(payment);
  }
}
