import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class TourInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tourInformation: string;

  @Column()
  latestNotice: string;

  @Column()
  latestNewsEvent: string;

  @Column()
  contactPhoneNumber: string;

  @Column()
  contactEmail: string;

  @Column()
  address: string;

  @Column()
  guidelines: string;

  @Column()
  importantInformation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  dateOfCreate: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  dateOfModify: Date;
}
