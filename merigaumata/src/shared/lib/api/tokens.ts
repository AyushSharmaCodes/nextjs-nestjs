/**
 * Safe client-server isomorphic session manager.
 * Now exclusively uses memory to avoid localStorage leaks.
 * Production auth relies on secure HTTP-only cookies and Server Actions.
 */

let memoryUserRole: string | null = null;
let memoryUserEmail: string | null = null;

export const tokenVault = {
  // Tokens are now managed securely via HTTP-Only cookies. 
  // The client should not access them.
  getToken: (): string | null => null,
  setToken: (token: string): void => {},
  clearToken: (): void => {},

  getUserRole: (): string | null => memoryUserRole,
  setUserRole: (role: string): void => {
    memoryUserRole = role;
  },
  clearUserRole: (): void => {
    memoryUserRole = null;
  },

  getUserEmail: (): string | null => memoryUserEmail,
  setUserEmail: (email: string): void => {
    memoryUserEmail = email;
  },
  clearUserEmail: (): void => {
    memoryUserEmail = null;
  }
};
