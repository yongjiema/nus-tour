import { Module, Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { buildTypeOrmOptions } from "./typeorm.config";
import { TimeSlot } from "./entities/timeSlot.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    TypeOrmModule.forFeature([TimeSlot]),
  ],
  providers: [],
})
export class DatabaseModule {
  // Seeding is handled centrally by DatabaseSeedModule in non-production environments

  /**
   * Non-static member so the class is not considered "empty" by the
   * @typescript-eslint/no-extraneous-class rule. It has no runtime cost.
   */
  private readonly _logger = new Logger(DatabaseModule.name);
}
