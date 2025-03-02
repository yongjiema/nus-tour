import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Check, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from './booking.entity';

@Entity()
@Check('CHK_payment_status_valid', "\"paymentStatus\" IN ('Pending', 'Paid', 'Failed')")
@Check('CHK_amount_positive', '"amount" > 0')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'paymentStatus', default: 'Pending' })
  paymentStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}
