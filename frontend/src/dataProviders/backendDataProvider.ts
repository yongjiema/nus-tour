import nestjsxCrudDataProvider from "@refinedev/nestjsx-crud";
import axiosInstance from "../axiosConfig";
import config from "../config";
import { BaseRecord, CrudFilters, CrudSorting, Pagination } from "@refinedev/core";

const dataProvider = nestjsxCrudDataProvider(config.apiBaseUrl, axiosInstance);

export const backend = {
  ...dataProvider,
  getList: async <TData extends BaseRecord = BaseRecord>(
    resource: string,
    { pagination, filters, sorters }: { pagination?: Pagination; filters?: CrudFilters; sorters?: CrudSorting },
  ) => {
    console.log("Data Provider getList args:", { resource, pagination, filters, sorters });
    try {
      const response = await dataProvider.getList<TData>({
        resource,
        pagination,
        filters,
        sorters,
      });
      console.log("Data Provider getList response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider getList error:", error);
      throw error;
    }
  },
  getOne: async <TData extends BaseRecord = BaseRecord>(resource: string, params: { id: string | number }) => {
    console.log("Data Provider getOne args:", { resource, params });
    try {
      const response = await dataProvider.getOne<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider getOne response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider getOne error:", error);
      throw error;
    }
  },
  create: async <TData extends BaseRecord = BaseRecord>(
    resource: string,
    params: { variables: Record<string, unknown> },
  ) => {
    console.log("Data Provider create args:", { resource, params });
    try {
      const response = await dataProvider.create<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider create response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider create error:", error);
      throw error;
    }
  },
  update: async <TData extends BaseRecord = BaseRecord>(
    resource: string,
    params: { id: string | number; variables: Record<string, unknown> },
  ) => {
    console.log("Data Provider update args:", { resource, params });
    try {
      const response = await dataProvider.update<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider update response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider update error:", error);
      throw error;
    }
  },
  deleteOne: async <TData extends BaseRecord = BaseRecord>(resource: string, params: { id: string | number }) => {
    console.log("Data Provider deleteOne args:", { resource, params });
    try {
      const response = await dataProvider.deleteOne<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider deleteOne response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider deleteOne error:", error);
      throw error;
    }
  },
  getMany: async <TData extends BaseRecord = BaseRecord>(resource: string, params: { ids: (string | number)[] }) => {
    console.log("Data Provider getMany args:", { resource, params });
    try {
      const response = await dataProvider.getMany<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider getMany response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider getMany error:", error);
      throw error;
    }
  },
  createMany: async <TData extends BaseRecord = BaseRecord>(
    resource: string,
    params: { variables: Record<string, unknown>[] },
  ) => {
    console.log("Data Provider createMany args:", { resource, params });
    try {
      const response = await dataProvider.createMany<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider createMany response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider createMany error:", error);
      throw error;
    }
  },
  deleteMany: async <TData extends BaseRecord = BaseRecord>(resource: string, params: { ids: (string | number)[] }) => {
    console.log("Data Provider deleteMany args:", { resource, params });
    try {
      const response = await dataProvider.deleteMany<TData>({
        resource,
        ...params,
      });
      console.log("Data Provider deleteMany response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider deleteMany error:", error);
      throw error;
    }
  },
  custom: async <TData extends BaseRecord = BaseRecord>(
    resource: string,
    params: {
      method: "get" | "delete" | "head" | "options" | "post" | "put" | "patch";
      url: string;
      payload?: Record<string, unknown>;
    },
  ) => {
    console.log("Data Provider custom args:", { resource, params });
    try {
      const response = await dataProvider.custom<TData>({
        ...params,
        meta: { resource },
      });
      console.log("Data Provider custom response:", response);
      return response;
    } catch (error) {
      console.error("Data Provider custom error:", error);
      throw error;
    }
  },
};
