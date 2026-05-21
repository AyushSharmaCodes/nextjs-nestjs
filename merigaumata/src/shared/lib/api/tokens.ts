/**
 * Client-side session state manager.
 * 
 * IMPORTANT: Auth tokens (JWTs) are now managed exclusively via secure HTTP-Only cookies.
 * This vault is used only to keep track of user metadata (role, email) for UI logic 
 * and hydration, ensuring a consistent user experience without exposing sensitive tokens to JS.
 */


export const tokenVault = {
  getToken: (): string | null => null,
  setToken: (token: string): void => {},
  clearToken: (): void => {},

  getUserRole: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mgm_user_role');
    }
    return null;
  },
  setUserRole: (role: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_user_role', role);
    }
  },
  clearUserRole: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mgm_user_role');
    }
  },

  getUserEmail: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mgm_user_email');
    }
    return null;
  },
  setUserEmail: (email: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_user_email', email);
    }
  },
  clearUserEmail: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mgm_user_email');
    }
  }
};
