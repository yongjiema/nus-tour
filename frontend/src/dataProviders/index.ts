import { backend } from "./backendDataProvider";
import type { DataProvider } from "@refinedev/core";

export const dataProviders = {
  default: backend as DataProvider,
  backend: backend as DataProvider,
};
