import nestjsxCrudDataProvider from "@refinedev/nestjsx-crud";
import axiosInstance from "../axiosConfig";
import config from "../config";

export const backend = nestjsxCrudDataProvider(config.apiBaseUrl, axiosInstance);
