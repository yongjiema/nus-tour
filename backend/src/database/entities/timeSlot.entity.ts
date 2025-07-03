import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("time_slot")
@Unique(["startsAt", "endsAt"])
export class TimeSlot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /** Start of the slot ("09:00:00"), stored in 24-hour format. */
  @Column({ type: "time without time zone" })
  startsAt!: string;

  /** End of the slot ("10:00:00"), stored in 24-hour format. */
  @Column({ type: "time without time zone" })
  endsAt!: string;

  /**
   * Maximum number of bookings that can be accommodated in this slot.
   * Defaults to 5 – can be managed directly in DB.
   */
  @Column({ default: 5 })
  capacity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  modifiedAt!: Date;

  /**
   * Human-readable label, computed on the fly – not persisted.
   * Example: "09:00 AM - 10:00 AM".
   */
  get label(): string {
    const format = (t: string) => {
      const [hStr, mStr] = t.split(":");
      let hour = parseInt(hStr, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      if (hour === 0) hour = 12;
      else if (hour > 12) hour -= 12;
      return `${hour.toString().padStart(2, "0")}:${mStr} ${ampm}`;
    };
    return `${format(this.startsAt)} - ${format(this.endsAt)}`;
  }
}
