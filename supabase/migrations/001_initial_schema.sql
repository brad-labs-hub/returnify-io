-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  -- Address fields
  street_address TEXT,
  unit TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  delivery_instructions TEXT,
  -- Metadata
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'driver')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  pickup_frequency TEXT NOT NULL, -- 'biweekly', 'weekly', '2x_weekly'
  max_items_per_pickup INTEGER, -- NULL means unlimited
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pickups table
CREATE TABLE public.pickups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_window TEXT NOT NULL,
  -- Address (can override profile address)
  street_address TEXT NOT NULL,
  unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  special_instructions TEXT,
  -- Status tracking
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'picked_up', 'completed', 'cancelled')),
  driver_id UUID REFERENCES public.profiles(id),
  picked_up_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Metadata
  total_items INTEGER DEFAULT 0,
  is_one_off BOOLEAN DEFAULT false,
  one_off_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pickup items table
CREATE TABLE public.pickup_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pickup_id UUID REFERENCES public.pickups(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  carrier TEXT NOT NULL CHECK (carrier IN ('ups', 'usps', 'fedex')),
  has_label BOOLEAN DEFAULT true,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'dropped_off')),
  dropped_off_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, price, description, pickup_frequency, max_items_per_pickup, is_popular, features) VALUES
('Bi-Weekly', 'biweekly', 24.99, 'Perfect for occasional returners', 'biweekly', 5, false,
  '["Pickups every 2 weeks", "Up to 5 items per pickup", "Email & SMS notifications", "Standard pickup windows"]'),
('Weekly', 'weekly', 39.99, 'Our most popular plan', 'weekly', 10, true,
  '["Pickups every week", "Up to 10 items per pickup", "Priority pickup windows", "Email & SMS notifications", "Flexible rescheduling"]'),
('Premium', 'premium', 59.99, 'For power shoppers', '2x_weekly', NULL, false,
  '["2x weekly pickups", "Unlimited items", "Same-day pickup available", "Dedicated support", "Email & SMS notifications", "Priority scheduling"]');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pickups policies
CREATE POLICY "Users can view own pickups" ON public.pickups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pickups" ON public.pickups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pickups" ON public.pickups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Drivers can view assigned pickups" ON public.pickups
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all pickups" ON public.pickups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pickup items policies
CREATE POLICY "Users can manage own pickup items" ON public.pickup_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pickups WHERE id = pickup_id AND user_id = auth.uid())
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pickups_updated_at
  BEFORE UPDATE ON public.pickups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
