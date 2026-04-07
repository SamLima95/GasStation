import { create } from 'zustand';
import type { User } from '../types/auth';
import { getToken, getUser, setToken as storeToken, setUser as storeUser, clearToken } from '../services/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: getUser(),
  isAuthenticated: !!getToken(),

  login: (token: string, user: User) => {
    storeToken(token);
    storeUser(user);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
