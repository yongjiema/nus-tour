import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Booking } from "./booking.entity";

@Entity()
export class Checkin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => Booking, (booking) => booking.checkin)
  @JoinColumn()
  booking!: Booking;

  @Column({ nullable: true })
  checkInTime!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  modifiedAt!: Date;
}
