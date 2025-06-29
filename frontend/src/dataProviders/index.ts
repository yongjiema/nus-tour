import { backend } from "./backendDataProvider";
import type { DataProvider } from "@refinedev/core";

const dataProviders = {
  default: backend as DataProvider,
  backend: backend as DataProvider,
};

export default dataProviders;
