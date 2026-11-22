import { http } from './http';

export interface CustomerItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchCustomers(search?: string): Promise<CustomerItem[]> {
  if (search && search.trim() !== '') {
    const res = await http.get<ApiResponse<CustomerItem[]>>('/customers/search', {
      params: { query: search.trim() },
    });
    return res.data.data;
  }
  const res = await http.get<ApiResponse<CustomerItem[]>>('/customers');
  return res.data.data;
}

export async function createCustomer(payload: CustomerRequest): Promise<CustomerItem> {
  const res = await http.post<ApiResponse<CustomerItem>>('/customers', payload);
  return res.data.data;
}

export async function updateCustomer(id: number, payload: CustomerRequest): Promise<CustomerItem> {
  const res = await http.put<ApiResponse<CustomerItem>>(`/customers/${id}`, payload);
  return res.data.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await http.delete(`/customers/${id}`);
}