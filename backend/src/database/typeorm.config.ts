import { DataSourceOptions } from "typeorm";
import { ENTITIES } from "./entities";
import { ConfigService } from "@nestjs/config";
import { getRequiredAppConfig } from "../config";

export function buildTypeOrmOptions(configService?: ConfigService): DataSourceOptions {
  // If configService is provided, use it; otherwise fall back to environment variables
  let dbConfig: ReturnType<typeof getRequiredAppConfig>["database"];
  if (configService) {
    const appConfig = getRequiredAppConfig(configService);
    dbConfig = appConfig.database;
  } else {
    dbConfig = {
      host: process.env.DB_HOST ?? "localhost",
      port: parseInt(process.env.DB_PORT ?? "5432", 10),
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "password",
      name: process.env.DB_NAME ?? "nus_tour",
      ssl: process.env.DB_SSL === "true",
    };
  }

  return {
    type: "postgres",
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.name,
    entities: ENTITIES,
    synchronize: process.env.NODE_ENV !== "production",
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
    extra: dbConfig.ssl ? { sslmode: "require" } : undefined,
  } as DataSourceOptions;
}
