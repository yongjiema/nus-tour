import nestjsxCrudDataProvider from "@refinedev/nestjsx-crud";
import axiosInstance from "../axiosConfig";
import config from "../config";
import {
  BaseRecord,
  GetListParams,
  GetOneParams,
  CreateParams,
  UpdateParams,
  DeleteOneParams,
  GetManyParams,
  CreateManyParams,
  DeleteManyParams,
  CustomParams,
  GetListResponse,
  GetOneResponse,
  CreateResponse,
  UpdateResponse,
  DeleteOneResponse,
  GetManyResponse,
  CreateManyResponse,
  DeleteManyResponse,
  CustomResponse,
} from "@refinedev/core";

const dataProvider = nestjsxCrudDataProvider(config.apiBaseUrl, axiosInstance);

export const backend = {
  ...dataProvider,

  getList: async <TData extends BaseRecord = BaseRecord>(params: GetListParams): Promise<GetListResponse<TData>> => {
    return dataProvider.getList<TData>(params);
  },

  getOne: async <TData extends BaseRecord = BaseRecord>(params: GetOneParams): Promise<GetOneResponse<TData>> => {
    return dataProvider.getOne<TData>(params);
  },

  create: async <TData extends BaseRecord = BaseRecord>(params: CreateParams): Promise<CreateResponse<TData>> => {
    return dataProvider.create<TData>(params);
  },

  update: async <TData extends BaseRecord = BaseRecord>(params: UpdateParams): Promise<UpdateResponse<TData>> => {
    return dataProvider.update<TData>(params);
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord>(
    params: DeleteOneParams,
  ): Promise<DeleteOneResponse<TData>> => {
    return dataProvider.deleteOne<TData>(params);
  },

  getMany: async <TData extends BaseRecord = BaseRecord>(params: GetManyParams): Promise<GetManyResponse<TData>> => {
    return dataProvider.getMany<TData>(params);
  },

  createMany: async <TData extends BaseRecord = BaseRecord>(
    params: CreateManyParams,
  ): Promise<CreateManyResponse<TData>> => {
    return dataProvider.createMany<TData>(params);
  },

  deleteMany: async <TData extends BaseRecord = BaseRecord>(
    params: DeleteManyParams,
  ): Promise<DeleteManyResponse<TData>> => {
    return dataProvider.deleteMany<TData>(params);
  },

  custom: async <TData extends BaseRecord = BaseRecord>(params: CustomParams): Promise<CustomResponse<TData>> => {
    return dataProvider.custom<TData>(params);
  },
};
