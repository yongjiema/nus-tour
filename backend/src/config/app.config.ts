import { registerAs } from "@nestjs/config";

export interface AppConfig {
  port: number;
  environment: string;
  cors: {
    origin: string;
    credentials: boolean;
    methods: string[];
    headers: string[];
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
}

export default registerAs(
  "app",
  (): AppConfig => ({
    port: parseInt(process.env.PORT ?? "3000", 10),
    environment: process.env.NODE_ENV ?? "development",
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      credentials: process.env.CORS_CREDENTIALS === "true",
      methods: (process.env.CORS_METHODS ?? "GET,POST,PUT,PATCH,DELETE").split(","),
      headers: (process.env.CORS_HEADERS ?? "Content-Type,Authorization").split(","),
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? "defaultSecretKey",
      expiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
    },
    database: {
      host: process.env.DB_HOST ?? "localhost",
      port: parseInt(process.env.DB_PORT ?? "5432", 10),
      name: process.env.DB_NAME ?? "nus_tour",
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "password",
      ssl: process.env.DB_SSL === "true",
    },
  }),
);
