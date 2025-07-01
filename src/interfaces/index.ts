export interface IUser {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  is_active: boolean;
  clerk_url: string;
  profile_image: string;
  avatar_url?: string; 
  is_customer?: boolean;
}
export interface IPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  monthly_price: number;
  quarterly_price: number;
  half_yearly_price: number;
  yearly_price: number;
  is_active: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  popular?: boolean;
}

export interface ISubscription {
  id: string;
  plan_id: string;
  plan?: IPlan; // run time data
  user_id: string;
  user?: IUser; // run time data
  payment_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  amount: number;
  total_duration: number;
  created_at: string;
  is_cash_approval?: boolean; // Add this field
  payment_gateway?: string;
  
}

export interface SubscriptionProgress {
  progressPercentage: number;
  daysRemaining: number;
  totalDays: number;
  isExpiring: boolean;
  isExpired: boolean;
  status: 'active' | 'expiring' | 'expired';
}
