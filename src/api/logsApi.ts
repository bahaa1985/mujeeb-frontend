import api from "./axios";
import type{ LogParams, SystemLog } from "../types/log";


export interface PaginatedLogs {
  data: SystemLog[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const getSystemLogs = async (params: LogParams): Promise<PaginatedLogs> => {
  const response = await api.get(`/logs`, { params });
  return response.data;
};