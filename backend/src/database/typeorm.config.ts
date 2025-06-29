import { DataSourceOptions } from "typeorm";
import { ENTITIES } from "./entities";

export function buildTypeOrmOptions(): DataSourceOptions {
  const sslEnabled = (process.env.DB_SSL ?? "false").toLowerCase() === "true";

  return {
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: +(process.env.DB_PORT ?? "5432"),
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "password",
    database: process.env.DB_NAME ?? "nus_tour",
    entities: ENTITIES,
    synchronize: process.env.NODE_ENV !== "production",
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    extra: sslEnabled ? { sslmode: "require" } : undefined,
  } as DataSourceOptions;
}
