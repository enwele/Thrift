import { Nullable } from './global';

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profile_image_url?: string;
  created_at: Date;
  last_login?: Date;
  is_verified: boolean;
}

export interface AuthContextType {
  user: Nullable<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'created_at'> & { password: string }) => Promise<void>;
}