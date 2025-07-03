import nestjsxCrudDataProvider from "@refinedev/nestjsx-crud";
import axiosInstance from "./axiosConfig";

const API_URL = import.meta.env.VITE_API_BASE_URL as string;

const dataProvider = nestjsxCrudDataProvider(API_URL, axiosInstance);

export default dataProvider;
