import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { Booking } from "./entities/booking.entity";
import { Checkin } from "./entities/checkin.entity";
import { Feedback } from "./entities/feedback.entity";
import { Payment } from "./entities/payments.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSslEnabled = (configService.get<string>("DB_SSL") ?? "false").toLowerCase() === "true";

        return {
          type: "postgres",
          host: configService.get("DB_HOST"),
          port: configService.get<number>("DB_PORT") ?? 5432,
          username: configService.get("DB_USER"),
          password: configService.get("DB_PASSWORD"),
          database: configService.get("DB_NAME"),
          entities: [User, Booking, Feedback, Payment, Checkin],
          synchronize: configService.get("NODE_ENV") !== "production",
          ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
          extra: isSslEnabled ? { sslmode: "require" } : undefined,
        };
      },
    }),
  ],
})
export class DatabaseModule {
  onModuleInit(): void {
    // Database module initialization logic if needed
  }
}
