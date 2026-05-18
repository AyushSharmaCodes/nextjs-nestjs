import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';
import { AuthResponse, Role } from '../types/auth.types';
import { tokenVault } from '@/shared/lib/api/tokens';
import { authLogger } from '@/shared/lib/logger';

export const authService = {
  login: async (credentials: LoginFormValues): Promise<AuthResponse> => {
    // Simulate real network/database latency for premium user experience
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Business logic and orchestration for authenticating the user.
    const trimmedEmail = credentials.email.trim().toLowerCase();
    let assignedRole: Role = 'USER';
    let message = 'Logged in successfully as Customer!';

    if (trimmedEmail === 'admin@merigaumata.com') {
      assignedRole = 'ADMIN';
      message = 'Welcome back, Administrator! (Bootstrapped Admin Account)';
    } else if (trimmedEmail === 'manager@merigaumata.com') {
      assignedRole = 'MANAGER';
      message = 'Welcome back, Manager! (Setup by Admin)';
    } else {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mgm_manager_accounts') : null;
      let foundCustomManager = false;
      if (stored) {
        try {
          const accounts = JSON.parse(stored) as Array<{ name: string; email: string }>;
          const match = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);
          if (match) {
            assignedRole = 'MANAGER';
            message = `Welcome back, Manager ${match.name}!`;
            foundCustomManager = true;
          }
        } catch (e) {
          authLogger.error('Failed to parse manager accounts: {error}', {
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    }

    const response: AuthResponse = {
      user: {
        email: trimmedEmail,
        role: assignedRole,
        name: assignedRole === 'ADMIN' ? 'Administrator' : assignedRole === 'MANAGER' ? 'Manager' : 'Customer'
      },
      token: `mock_jwt_token_${assignedRole.toLowerCase()}`,
      message
    };

    tokenVault.setToken(response.token);
    tokenVault.setUserRole(response.user.role);
    tokenVault.setUserEmail(response.user.email);

    return response;
  },

  signup: async (data: SignupFormValues): Promise<AuthResponse> => {
    // Simulate real network/database latency for premium user experience
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const trimmedEmail = data.email.trim().toLowerCase();
    
    const response: AuthResponse = {
      user: {
        email: trimmedEmail,
        role: 'USER',
        name: `${data.firstName} ${data.lastName}`
      },
      token: 'mock_jwt_token_user',
      message: 'Account created successfully! Your default role is: Customer (USER).'
    };

    tokenVault.setToken(response.token);
    tokenVault.setUserRole(response.user.role);
    tokenVault.setUserEmail(response.user.email);

    return response;
  },

  logout: () => {
    tokenVault.clearToken();
    tokenVault.clearUserRole();
    tokenVault.clearUserEmail();
  }
};
