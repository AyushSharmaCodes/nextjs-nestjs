'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSessionAction, logoutAction } from '@/features/auth/actions/auth.actions';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = async () => {
    setIsLoading(true);
    const { user } = await getSessionAction();
    setUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, [pathname]);

  const logout = async () => {
    await logoutAction();
    setUser(null);
    router.push('/en/auth/login');
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshSession, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
