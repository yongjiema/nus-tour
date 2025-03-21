import { backend } from "./backendDataProvider";
import { DataProvider } from "@refinedev/core";

// Create a DataProviders object with proper typing
const dataProviders = {
  default: backend as DataProvider,
  backend: backend as DataProvider,
};

export default dataProviders;
