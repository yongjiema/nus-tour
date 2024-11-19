import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  bookingId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  groupSize: number;

  @Column({ default: 50 })
  deposit: number;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column()
  timeSlot: string;

  @BeforeInsert()
  generateBookingId() {
    this.bookingId = uuidv4();
  }
}
