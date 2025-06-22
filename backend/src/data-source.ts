import { DataSource } from "typeorm";
import { User } from "./database/entities/user.entity";
import { Booking } from "./database/entities/booking.entity";
import { Payment } from "./database/entities/payments.entity";
import { Checkin } from "./database/entities/checkin.entity";
import { Feedback } from "./database/entities/feedback.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "password",
  database: process.env.DB_NAME ?? "nus_tour",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Booking, Payment, Checkin, Feedback],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});

void AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error: unknown) => {
    console.error("Error during Data Source initialization:", error);
  });
