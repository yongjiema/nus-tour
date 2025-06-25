import { DataSource } from "typeorm";
import { buildTypeOrmOptions } from "./database/typeorm.config";

export const AppDataSource = new DataSource(buildTypeOrmOptions());

void AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error: unknown) => {
    console.error("Error during Data Source initialization:", error);
  });
