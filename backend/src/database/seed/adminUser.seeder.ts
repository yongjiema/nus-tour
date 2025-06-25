import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import * as bcrypt from "bcrypt";
import { RoleSeeder } from "./role.seeder";

@Injectable()
export class AdminUserSeeder {
  private readonly logger = new Logger(AdminUserSeeder.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly roleSeeder: RoleSeeder,
  ) {}

  async seed(): Promise<void> {
    // Do not run in production
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const adminEmail = process.env.DEV_ADMIN_EMAIL ?? "admin@nus.edu.sg";
    const adminPassword = process.env.DEV_ADMIN_PASSWORD ?? "admin123";

    const existing = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (existing) {
      return; // already there → idempotent
    }

    const roles = await this.roleSeeder.seed();
    const adminRole = roles.find((r) => r.name === "ADMIN");
    if (!adminRole) {
      this.logger.error("ADMIN role not found during seeding – skipping admin user creation");
      return;
    }

    const adminUser = this.userRepo.create({
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      firstName: "Dev",
      lastName: "Admin",
      emailVerified: true,
      isActive: true,
      roles: [adminRole],
    });
    await this.userRepo.save(adminUser);

    this.logger.warn(`🚨  Dev admin created → ${adminEmail} / ${adminPassword}  (development only)`);
  }
}
