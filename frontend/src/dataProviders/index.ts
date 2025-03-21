import { backend } from "./backendDataProvider";
import { DataProvider } from "@refinedev/core";

const dataProviders = {
  default: backend as DataProvider,
  backend: backend as DataProvider,
};

export default dataProviders;
