export { default as appConfig } from "./app.config";
export type { AppConfig } from "./app.config";

import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "./app.config";

/**
 * Safely retrieves the required app configuration from ConfigService.
 * Throws an error if the config is not loaded.
 *
 * @param configService - The NestJS ConfigService instance
 * @returns The typed AppConfig object
 * @throws Error if app config is not loaded
 */
export function getRequiredAppConfig(configService: ConfigService): AppConfig {
  const appConfig = configService.get<AppConfig>("app");
  if (!appConfig) {
    throw new Error("Required app config not loaded!");
  }
  return appConfig;
}
