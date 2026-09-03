import { createContext } from 'react';
import type { User, AuthResponse } from '@/features/auth/types/auth.types';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (response: AuthResponse, rememberMe?: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
