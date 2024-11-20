import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingId: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'Pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
