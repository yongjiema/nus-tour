import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  Index,
} from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";

@Entity()
@Check("CHK_feedback_rating_range", '"rating" >= 1 AND "rating" <= 5')
@Index("IDX_feedback_user", ["user"])
@Index("IDX_feedback_booking", ["booking"])
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Booking)
  booking!: Booking;

  @Column({ type: "int", default: 5 })
  rating!: number;

  @Column({ type: "varchar", length: 2000 })
  comments!: string;

  @Column({ default: false })
  isPublic!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  modifiedAt!: Date;
}
