import { http } from './http';

export interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
}

export interface ServiceRequest {
  name: string;
  description?: string;
  price: number;
  active: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current 0-based page
  size: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchServices(params: {
  search?: string;
  active?: boolean | null;
  page?: number;
  size?: number;
}): Promise<PageResponse<ServiceItem>> {
  const queryParams: Record<string, string | number | boolean> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
  };
  if (params.search && params.search.trim() !== '') {
    queryParams.search = params.search.trim();
  }
  if (params.active !== null && params.active !== undefined) {
    queryParams.active = params.active;
  }

  const res = await http.get<ApiResponse<PageResponse<ServiceItem>>>('/services', {
    params: queryParams,
  });
  return res.data.data;
}

export async function createService(payload: ServiceRequest): Promise<ServiceItem> {
  const res = await http.post<ApiResponse<ServiceItem>>('/services', payload);
  return res.data.data;
}

export async function updateService(id: number, payload: ServiceRequest): Promise<ServiceItem> {
  const res = await http.put<ApiResponse<ServiceItem>>(`/services/${id}`, payload);
  return res.data.data;
}

export async function deleteService(id: number): Promise<void> {
  await http.delete(`/services/${id}`);
}