import { apiInstance } from '@/shared/lib/api';
import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';
import { AuthResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginFormValues): Promise<AuthResponse> => {
    return apiInstance.post<any, AuthResponse>('/auth/login', credentials);
  },
  signup: async (data: SignupFormValues): Promise<AuthResponse> => {
    return apiInstance.post<any, AuthResponse>('/auth/signup', data);
  },
};
