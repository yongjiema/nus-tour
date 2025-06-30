import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimeSlotSeeder } from "./timeSlot.seeder";
import { RoleSeeder } from "./role.seeder";
import { AdminUserSeeder } from "./adminUser.seeder";
import { DemoUsersSeeder } from "./demoUsers.seeder";
import { TimeSlot } from "../entities/timeSlot.entity";
import { Role } from "../entities/role.entity";
import { User } from "../entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlot, Role, User])],
  providers: [TimeSlotSeeder, RoleSeeder, AdminUserSeeder, DemoUsersSeeder],
})
export class DatabaseSeedModule implements OnModuleInit {
  constructor(
    private readonly timeSlotSeeder: TimeSlotSeeder,
    private readonly adminSeeder: AdminUserSeeder,
    private readonly demoUsersSeeder: DemoUsersSeeder,
  ) {}

  async onModuleInit() {
    await this.timeSlotSeeder.seed();
    await this.adminSeeder.seed();
    await this.demoUsersSeeder.seed();
  }
}
