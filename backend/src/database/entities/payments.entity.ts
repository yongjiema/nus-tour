import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Check } from 'typeorm';

@Entity()
@Check('CHK_payment_status_valid', "\"paymentStatus\" IN ('Pending', 'Paid', 'Failed')")
@Check('CHK_amount_positive', '"amount" > 0')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingId: string;

  @Column('decimal')
  amount: number;

  @Column({ name: 'paymentStatus', default: 'Pending' })
  paymentStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}
