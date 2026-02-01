-- Square Payment Integration Migration
-- Run this in Supabase SQL Editor

-- Rename Stripe fields to Square in subscriptions table
ALTER TABLE public.subscriptions
  RENAME COLUMN stripe_subscription_id TO square_subscription_id;

ALTER TABLE public.subscriptions
  RENAME COLUMN stripe_customer_id TO square_customer_id;

-- Add Square-specific fields to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS square_plan_variation_id TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Add Square customer ID to profiles for direct reference
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS square_customer_id TEXT UNIQUE;

-- Add Square catalog object ID to subscription_plans for syncing
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS square_catalog_object_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS square_plan_variation_id TEXT UNIQUE;

-- Create payments table for tracking all transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pickup_id UUID REFERENCES public.pickups(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  square_payment_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'one_off')),
  card_brand TEXT,
  card_last_four TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add payment reference to pickups for one-off payments
ALTER TABLE public.pickups
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Create webhook events table for idempotency
CREATE TABLE IF NOT EXISTS public.square_webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.square_webhook_events ENABLE ROW LEVEL SECURITY;

-- Payments policies - users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all payments (for API routes)
CREATE POLICY "Service role can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update payments" ON public.payments
  FOR UPDATE USING (true);

-- Webhook events only accessible by service role (handled via service role key)
CREATE POLICY "Service role can manage webhook events" ON public.square_webhook_events
  FOR ALL USING (true);

-- Add updated_at trigger for payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_square_webhook_events_event_id ON public.square_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_square_payment_id ON public.payments(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_pickup_id ON public.payments(pickup_id);
CREATE INDEX IF NOT EXISTS idx_profiles_square_customer_id ON public.profiles(square_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_square_subscription_id ON public.subscriptions(square_subscription_id);
