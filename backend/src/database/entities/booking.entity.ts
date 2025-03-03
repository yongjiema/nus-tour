import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, Check } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
@Check('CHK_email_format', "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
@Check('CHK_groupSize_range', '"groupSize" > 0 AND "groupSize" <= 50')
@Check(
  'CHK_timeslot_valid',
  "\"timeSlot\" IN ('09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM')",
)
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

  @Column()
  timeSlot: string;

  @Column({ default: false })
  hasFeedback: boolean;

  @Column({ default: 'pending' })
  bookingStatus: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @BeforeInsert()
  generateBookingId() {
    this.bookingId = uuidv4();
  }
}
