import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import * as bcrypt from "bcrypt";

interface DemoAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class DemoUsersSeeder {
  private readonly logger = new Logger(DemoUsersSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async seed(): Promise<void> {
    // avoid polluting production database
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const demoAccounts: DemoAccount[] = [
      {
        email: "example1@nus.edu.sg",
        password: "example1@nus.edu.sg",
        firstName: "Example",
        lastName: "One",
      },
      {
        email: "example2@nus.edu.sg",
        password: "example2@nus.edu.sg",
        firstName: "Example",
        lastName: "Two",
      },
    ];

    const userRole = await this.roleRepo.findOne({ where: { name: "USER" } });
    if (!userRole) {
      this.logger.error("USER role not found - demo user seeding skipped");
      return;
    }

    for (const acc of demoAccounts) {
      const exists = await this.userRepo.findOne({ where: { email: acc.email } });
      if (exists) {
        continue; // keep idempotent
      }

      const user = this.userRepo.create({
        email: acc.email,
        password: await bcrypt.hash(acc.password, 10),
        firstName: acc.firstName,
        lastName: acc.lastName,
        emailVerified: true,
        isActive: true,
        roles: [userRole],
      });
      await this.userRepo.save(user);
      this.logger.log(`Demo user created → ${acc.email} / ${acc.password}`);
    }
  }
}
