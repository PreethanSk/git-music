import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  pfpUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  name?: string;
  password: string;
  pfpUrl?: string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          await axios.post('/api/userSignin', { email, password });
          const { data } = await axios.get('/api/dashboardProfile');
          set({ user: data.profile, isAuthenticated: true });
        } catch (error) {
          throw new Error('Login failed');
        }
      },
      register: async (data: RegisterData) => {
        try {
          await axios.post('/api/userSignup', data);
        } catch (error) {
          throw new Error('Registration failed');
        }
      },
      logout: async () => {
        try {
          await axios.post('/api/userLogout');
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          throw new Error('Logout failed');
        }
      },
      updateProfile: async (data: Partial<User>) => {
        try {
          await axios.put('/api/updateProfile', data);
          const { data: profile } = await axios.get('/api/dashboardProfile');
          set({ user: profile.profile });
        } catch (error) {
          throw new Error('Profile update failed');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);