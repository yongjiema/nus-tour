import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "./database/entities/user.entity";
import { Booking } from "./database/entities/booking.entity";
import { ConfigModule } from "@nestjs/config";
import { Payment } from "./database/entities/payments.entity";

// Initialize ConfigService
ConfigModule.forRoot();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST", "localhost"),
  port: configService.get<number>("DB_PORT", 5432),
  ssl: configService.get("DB_SSL") === "true" ? { rejectUnauthorized: false } : false,
  database: configService.get("DB_NAME", "nus_tour"),
  username: configService.get("DB_USER", "postgres"),
  password: configService.get("DB_PASSWORD", "password"),
  entities: [User, Booking, Payment],
  synchronize: false, // Disable synchronize for migrations
  logging: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
