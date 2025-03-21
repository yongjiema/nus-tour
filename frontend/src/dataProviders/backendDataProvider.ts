import nestjsxCrudDataProvider from "@refinedev/nestjsx-crud";
import axiosInstance from "../axiosConfig";
import config from "../config";

const dataProvider = nestjsxCrudDataProvider(config.apiBaseUrl, axiosInstance);

// Add logging wrapper
export const backend = {
  ...dataProvider,
  getList: async (...args) => {
    console.log("Data Provider getList args:", args);
    try {
      const response = await dataProvider.getList(...args);
      console.log("Data Provider getList response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider getList error:", error);
      throw error;
    }
  },
  getOne: async (...args) => {
    console.log("Data Provider getOne args:", args);
    try {
      const response = await dataProvider.getOne(...args);
      console.log("Data Provider getOne response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider getOne error:", error);
      throw error;
    }
  },
  create: async (...args) => {
    console.log("Data Provider create args:", args);
    try {
      const response = await dataProvider.create(...args);
      console.log("Data Provider create response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider create error:", error);
      throw error;
    }
  },
  update: async (...args) => {
    console.log("Data Provider update args:", args);
    try {
      const response = await dataProvider.update(...args);
      console.log("Data Provider update response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider update error:", error);
      throw error;
    }
  },
  deleteOne: async (...args) => {
    console.log("Data Provider deleteOne args:", args);
    try {
      const response = await dataProvider.deleteOne(...args);
      console.log("Data Provider deleteOne response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider deleteOne error:", error);
      throw error;
    }
  },
  getMany: async (...args) => {
    console.log("Data Provider getMany args:", args);
    try {
      const response = await dataProvider.getMany(...args);
      console.log("Data Provider getMany response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider getMany error:", error);
      throw error;
    }
  },
  createMany: async (...args) => {
    console.log("Data Provider createMany args:", args);
    try {
      const response = await dataProvider.createMany(...args);
      console.log("Data Provider createMany response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider createMany error:", error);
      throw error;
    }
  },
  deleteMany: async (...args) => {
    console.log("Data Provider deleteMany args:", args);
    try {
      const response = await dataProvider.deleteMany(...args);
      console.log("Data Provider deleteMany response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider deleteMany error:", error);
      throw error;
    }
  },
  custom: async (...args) => {
    console.log("Data Provider custom args:", args);
    try {
      const response = await dataProvider.custom(...args);
      console.log("Data Provider custom response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider custom error:", error);
      throw error;
    }
  },
};
