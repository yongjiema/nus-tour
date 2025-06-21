import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Booking)
  booking!: Booking;

  @Column({ type: "int", default: 5 })
  rating!: number;

  @Column({ type: "text" })
  comments!: string;

  @Column({ default: false })
  isPublic!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
