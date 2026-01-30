// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: Address | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip_code: string;
  instructions?: string;
}

// Subscription Plan Types
export type PlanType = 'biweekly' | 'weekly' | 'premium' | 'one-off';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  description: string;
  features: string[];
  pickup_frequency: string;
  max_items_per_pickup: number | null;
  is_popular?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// Pickup Scheduling Types
export type PickupStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export type Carrier = 'ups' | 'usps' | 'fedex';

export interface PickupItem {
  id: string;
  pickup_id: string;
  description: string;
  carrier: Carrier;
  tracking_number?: string;
  return_label_url?: string;
  status: 'pending' | 'picked_up' | 'dropped_off';
  created_at: string;
}

export interface Pickup {
  id: string;
  user_id: string;
  subscription_id?: string;
  scheduled_date: string;
  scheduled_time_window: string;
  status: PickupStatus;
  address: Address;
  special_instructions?: string;
  items: PickupItem[];
  total_items: number;
  driver_id?: string;
  picked_up_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PickupTimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  available_slots: number;
  is_premium_only: boolean;
}

// Admin Dashboard Types
export interface AdminDashboardStats {
  total_users: number;
  active_subscriptions: number;
  pickups_today: number;
  pickups_this_week: number;
  revenue_this_month: number;
  pending_pickups: number;
}

export interface PickupWithUser extends Pickup {
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  assigned_areas: string[];
  current_pickups: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Form Types
export interface SchedulePickupFormData {
  scheduled_date: string;
  scheduled_time_window: string;
  address: Address;
  special_instructions?: string;
  items: Omit<PickupItem, 'id' | 'pickup_id' | 'status' | 'created_at'>[];
}

export interface SignUpFormData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
