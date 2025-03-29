// Define shared types for the thrift system

export interface ThriftSystem {
    id: string;
    name: string;
    description: string;
    contribution_amount: number;
    frequency: string;
    status: 'active' | 'completed' | 'paused';
    creator_id: string;
    total_members: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface ThriftSystemMembership {
    id: string;
    user_id: string;
    thrift_system_id: string;
    role: 'admin' | 'member';
    is_active: boolean;
    joined_at: string;
  }
  
  export interface Contribution {
    id: string;
    user_id: string;
    thrift_system_id: string;
    amount: number;
    contribution_date: string;
    status: 'pending' | 'completed' | 'failed';
  }
  
  export interface Payout {
    id: string;
    thrift_system_id: string;
    recipient_id: string;
    amount: number;
    payout_date: string;
    status: 'scheduled' | 'processing' | 'completed' | 'failed';
  }
  
  export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
  }
  
  export interface CreateThriftSystemPayload {
    name: string;
    description: string;
    contribution_amount: number;
    frequency: string;
    status?: 'active' | 'paused';
  }
  
  export interface UpdateThriftSystemPayload {
    name?: string;
    description?: string;
    contribution_amount?: number;
    frequency?: string;
    status?: 'active' | 'completed' | 'paused';
  }