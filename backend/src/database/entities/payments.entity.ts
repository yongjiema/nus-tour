import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Check,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Booking } from "./booking.entity";

@Entity("payment")
@Check("CHK_amount_positive", '"amount" > 0')
@Index("IDX_payment_transaction_id", ["transactionId"])
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  bookingId!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ nullable: true, length: 255 })
  transactionId!: string;

  @Column({ nullable: true, length: 100 })
  paymentMethod!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  modifiedAt!: Date;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: "bookingId" })
  booking!: Booking;
}
