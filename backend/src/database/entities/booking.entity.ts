import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Check,
  OneToOne,
  CreateDateColumn,
  ManyToOne,
  Index,
  UpdateDateColumn,
} from "typeorm";
import { Checkin } from "./checkin.entity";
import { Payment } from "./payments.entity";
import { BookingStatus } from "./enums";
import { User } from "./user.entity";

@Entity("booking")
@Check("CHK_groupSize_range", '"groupSize" > 0 AND "groupSize" <= 50')
@Index("IDX_booking_date_timeslot", ["date", "timeSlot"]) // Non-unique index for performance
export class Booking {
  /**
   * Primary identifier – exposed to clients. Using UUID prevents row-count inference.
   */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "date" })
  date!: Date; // The date of the booking itself

  @Column()
  groupSize!: number;

  @Column({ default: 50 })
  deposit!: number;

  @Column({ length: 50 })
  timeSlot!: string;

  @Column({ default: false })
  hasFeedback!: boolean;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.AWAITING_PAYMENT,
  })
  status!: BookingStatus;

  @CreateDateColumn()
  createdAt!: Date; // When the booking record was created

  @UpdateDateColumn()
  modifiedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date; // When the slot reservation expires (for SLOT_RESERVED status)

  @OneToOne(() => Checkin, (checkin) => checkin.booking, { nullable: true })
  checkin!: Checkin | null;

  @OneToOne(() => Payment, (payment) => payment.booking, { nullable: true })
  payment!: Payment | null;

  // Relation to the user who created the booking.
  @ManyToOne(() => User, (user) => user.bookings, { nullable: false, eager: true })
  user!: User;
}
