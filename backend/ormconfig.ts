import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const config: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    sslmode: process.env.DB_SSLMODE,
  },
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  synchronize: false,
  logging: true,
};

export default config;
