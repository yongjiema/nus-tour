import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Check,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { PaymentStatus } from "./enums";

@Entity("payment")
@Check("CHK_payment_status_valid", "\"status\" IN ('pending', 'completed')")
@Check("CHK_amount_positive", '"amount" > 0')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: "bookingId" })
  booking: Booking;
}
export { PaymentStatus };
