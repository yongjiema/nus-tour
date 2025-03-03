// filepath: /c:/nus-tour/backend/src/database/entities/information.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';

@Entity()
@Check('CHK_modifiedBy_valid', "modifiedBy IN ('ZiMing', 'YongJie', 'GuangZu', 'YanKun')")
export class Information {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  hyperlink: string;

  @Column({ nullable: true }) // Allow NULL values
  image: string;

  @Column({ default: 'YongJie', name: 'modifiedby' })
  modifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;
}