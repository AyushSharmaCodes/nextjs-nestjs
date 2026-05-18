export type Role = 'USER' | 'ADMIN' | 'MANAGER';

export interface User {
  email: string;
  role: Role;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}
