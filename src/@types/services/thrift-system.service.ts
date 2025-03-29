import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ThriftSystem,
  ThriftSystemMembership,
  Contribution,
  Payout,
  ApiResponse,
  CreateThriftSystemPayload,
  UpdateThriftSystemPayload
} from '@/types';
import authService from './auth.service';

class ThriftSystemService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Create a new Thrift System
  async createThriftSystem(
    payload: CreateThriftSystemPayload
  ): Promise<ApiResponse<ThriftSystem>> {
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await this.supabase
        .from('thrift_systems')
        .insert({
          ...payload,
          creator_id: currentUser.id,
          total_members: 1, // Creator is the first member
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin to the system
      await this.supabase
        .from('thrift_system_memberships')
        .insert({
          user_id: currentUser.id,
          thrift_system_id: data.id,
          role: 'admin',
          is_active: true
        });

      return {
        data,
        error: null,
        status: 201
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create thrift system',
        status: error.status || 400
      };
    }
  }

  // Update Thrift System
  async updateThriftSystem(
    systemId: string, 
    payload: UpdateThriftSystemPayload
  ): Promise<ApiResponse<ThriftSystem>> {
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // Check if user is admin of this system
      const { data: membership } = await this.supabase
        .from('thrift_system_memberships')
        .select('*')
        .eq('thrift_system_id', systemId)
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .single();

      if (!membership) {
        throw new Error('Only system admins can update the system');
      }

      const { data, error } = await this.supabase
        .from('thrift_systems')
        .update(payload)
        .eq('id', systemId)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: 200
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update thrift system',
        status: error.status || 400
      };
    }
  }

  // Get Thrift Systems (with filtering and pagination)
  async getThriftSystems(options: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<{
    systems: ThriftSystem[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    try {
      const { page = 1, pageSize = 10, status, search } = options;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = this.supabase
        .from('thrift_systems')
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: {
          systems: data,
          total: count || 0,
          page,
          pageSize
        },
        error: null,
        status: 200
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch thrift systems',
        status: error.status || 400
      };
    }
  }

  // Join a Thrift System
  async joinThriftSystem(
    systemId: string
  ): Promise<ApiResponse<ThriftSystemMembership>> {
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // Check if user is already a member
      const { data: existingMembership } = await this.supabase
        .from('thrift_system_memberships')
        .select('*')
        .eq('thrift_system_id', systemId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingMembership) {
        throw new Error('You are already a member of this thrift system');
      }

      // Add user to the system
      const { data, error } = await this.supabase
        .from('thrift_system_memberships')
        .insert({
          user_id: currentUser.id,
          thrift_system_id: systemId,
          role: 'member',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Update total members count
      await this.supabase.rpc('increment_thrift_system_members', { 
        system_id: systemId 
      });

      return {
        data,
        error: null,
        status: 201
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to join thrift system',
        status: error.status || 400
      };
    }
  }

  // Make a Contribution
  async makeContribution(
    systemId: string, 
    amount: number
  ): Promise<ApiResponse<Contribution>> {
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // Verify user is a member of the system
      const { data: membership } = await this.supabase
        .from('thrift_system_memberships')
        .select('*')
        .eq('thrift_system_id', systemId)
        .eq('user_id', currentUser.id)
        .single();

      if (!membership) {
        throw new Error('You are not a member of this thrift system');
      }

      const { data, error } = await this.supabase
        .from('contributions')
        .insert({
          user_id: currentUser.id,
          thrift_system_id: systemId,
          amount,
          contribution_date: new Date(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: 201
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to make contribution',
        status: error.status || 400
      };
    }
  }

  // Initiate Payout
  async initiatePayout(
    systemId: string, 
    recipientId: string
  ): Promise<ApiResponse<Payout>> {
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // Verify user is an admin of the system
      const { data: membership } = await this.supabase
        .from('thrift_system_memberships')
        .select('*')
        .eq('thrift_system_id', systemId)
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .single();

      if (!membership) {
        throw new Error('Only system admins can initiate payouts');
      }

      // Calculate payout amount (can be more complex based on business logic)
      const { data: contributions } = await this.supabase
        .from('contributions')
        .select('amount')
        .eq('thrift_system_id', systemId)
        .eq('status', 'completed');

      const totalContributions = contributions?.reduce(
        (sum, contrib) => sum + contrib.amount, 
        0
      ) || 0;

      const { data, error } = await this.supabase
        .from('payouts')
        .insert({
          thrift_system_id: systemId,
          recipient_id: recipientId,
          amount: totalContributions,
          payout_date: new Date(),
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: 201
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to initiate payout',
        status: error.status || 400
      };
    }
  }
}

export default new ThriftSystemService();