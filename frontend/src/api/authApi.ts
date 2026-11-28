import { http } from './http';
import type { AuthUser } from '../auth/AuthContext';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expiresIn: number;
  user: AuthUser;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string> | null;
  timestamp: string;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResult> {
  const response = await http.post<ApiResponse<LoginResult>>('/auth/login', payload);
  return response.data.data;
}