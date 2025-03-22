import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Booking } from "./booking.entity";

@Entity()
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: "pending" })
  status: string;

  @OneToOne(() => Booking, (booking) => booking.checkin)
  @JoinColumn()
  booking: Booking;

  @Column({ nullable: true })
  checkInTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
