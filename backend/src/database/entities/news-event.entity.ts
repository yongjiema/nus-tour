import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class NewsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'news' 或 'event'

  @Column({ type: "timestamp" })
  date: Date;

  @Column({ length: 500 })
  headline: string;

  @Column({ length: 1000 })
  link: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
