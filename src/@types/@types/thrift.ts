export enum ThriftSystemStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    DRAFT = 'draft'
  }
  
  export enum ContributionFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly'
  }
  
  export interface ThriftSystem {
    id: string;
    name: string;
    description?: string;
    creator_id: string;
    status: ThriftSystemStatus;
    total_members: number;
    contribution_amount: number;
    contribution_frequency: ContributionFrequency;
    start_date: Date;
    end_date?: Date;
    target_amount?: number;
    privacy_level: 'public' | 'private' | 'invite_only';
  }
  
  export interface ThriftSystemMembership {
    id: string;
    user_id: string;
    thrift_system_id: string;
    role: 'admin' | 'member' | 'pending';
    joined_at: Date;
    is_active: boolean;
    contributions_made: number;
  }
  
  export interface Contribution {
    id: string;
    user_id: string;
    thrift_system_id: string;
    amount: number;
    contribution_date: Date;
    status: 'pending' | 'completed' | 'missed';
    payment_method: 'bank_transfer' | 'mobile_money' | 'cash';
  }
  
  export interface Payout {
    id: string;
    thrift_system_id: string;
    recipient_id: string;
    amount: number;
    payout_date: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
    payout_method: 'bank_transfer' | 'mobile_money';
  }
  
  export interface Invitation {
    id: string;
    thrift_system_id: string;
    inviter_id: string;
    invitee_email: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: Date;
    expires_at: Date;
  }
  
  // Utility Types
  export type CreateThriftSystemPayload = Omit<ThriftSystem, 'id' | 'created_at'>;
  export type UpdateThriftSystemPayload = Partial<CreateThriftSystemPayload>;