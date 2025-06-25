import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { IsEmail } from "class-validator";
import { Role } from "./role.entity";
import { Booking } from "./booking.entity";

@Entity()
@Check("CHK_email_format", "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
@Check("CHK_password_length", "LENGTH(password) >= 6")
@Index("IDX_user_email", ["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true, length: 100 })
  firstName?: string;

  @Column({ nullable: true, length: 100 })
  lastName?: string;

  @Column({ unique: true, length: 255 })
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  modifiedAt!: Date;

  /**
   * Stores all roles assigned to the user. Implemented as a simple-array
   * column so it is compatible with most SQL dialects.
   */
  @ManyToMany(() => Role, { eager: true, cascade: true })
  @JoinTable()
  roles!: Role[];

  /**
   * Bookings created by the user.
   * This relation may be undefined when a user has not made any bookings yet.
   */
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings?: Booking[];

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
