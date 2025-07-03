import nestjsxCrudDataProvider from "@refinedev/nestjsx-crud";
import axiosInstance from "../axiosConfig";
import config from "../config";

const dataProvider = nestjsxCrudDataProvider(config.apiBaseUrl, axiosInstance);

export const backend = {
  ...dataProvider,
};
