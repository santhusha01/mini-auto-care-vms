import { http } from './http';
import type { PageResponse } from './servicesApi';

export interface InventoryItem {
  id: number;
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  lowStock: boolean;
  active: boolean;
}

export interface InventoryRequest {
  name: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchInventory(params: {
  search?: string;
  lowStock?: boolean;
  page?: number;
  size?: number;
}): Promise<PageResponse<InventoryItem>> {
  const queryParams: Record<string, string | number | boolean> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
    lowStock: params.lowStock ?? false,
  };
  if (params.search && params.search.trim() !== '') {
    queryParams.search = params.search.trim();
  }
  const res = await http.get<ApiResponse<PageResponse<InventoryItem>>>('/inventory', {
    params: queryParams,
  });
  return res.data.data;
}

export async function createInventoryItem(payload: InventoryRequest): Promise<InventoryItem> {
  const res = await http.post<ApiResponse<InventoryItem>>('/inventory', payload);
  return res.data.data;
}

export async function updateInventoryItem(
  id: number,
  payload: InventoryRequest,
): Promise<InventoryItem> {
  const res = await http.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, payload);
  return res.data.data;
}

export async function adjustStock(
  id: number,
  delta: number,
  reason?: string,
): Promise<InventoryItem> {
  const res = await http.put<ApiResponse<InventoryItem>>(`/inventory/${id}/stock`, {
    delta,
    reason,
  });
  return res.data.data;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await http.delete(`/inventory/${id}`);
}