import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getCurrentUser() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        return { data: null, error: 'No active session' };
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to get current user'
      };
    }
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to login'
      };
    }
  }

  async register(email: string, password: string, userData: Partial<User>) {
    try {
      // Register the user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert additional user data
        const { error: profileError } = await this.supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            ...userData
          });

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to register'
      };
    }
  }

  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return {
        error: error.message || 'Failed to logout'
      };
    }
  }
}

export default new AuthService();