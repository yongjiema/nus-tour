import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, Check } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
@Check('CHK_email_format', "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
@Check('CHK_username_not_empty', "username <> ''")
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: '' })
  unhashedPassword: string;

  @Column({ default: 'User' })
  role: string;

  @BeforeInsert()
  async hashPassword() {
    this.unhashedPassword = this.password;
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
