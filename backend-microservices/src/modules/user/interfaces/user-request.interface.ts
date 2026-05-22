import { FastifyRequest } from 'fastify';
import { UserRole } from '../types/user-role.enum';

export interface UserRequest extends FastifyRequest {
  user: {
    id: string; // The user ID from BetterAuth/JWT (userId in profiles)
    profileId: string; // The actual Profile PK
    role: UserRole;
    email?: string;
  };
}
