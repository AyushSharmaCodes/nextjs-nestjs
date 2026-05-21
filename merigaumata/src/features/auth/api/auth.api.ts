import { apiInstance } from '@/shared/lib/api';
import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';
import { AuthResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginFormValues): Promise<AuthResponse> => {
    const response = await apiInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  signup: async (data: SignupFormValues): Promise<AuthResponse> => {
    const response = await apiInstance.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },
};
