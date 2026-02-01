import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubscriptionStatus } from '@/components/payment/SubscriptionStatus';
import {
  Package,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle,
  Truck,
} from 'lucide-react';
import { SignOutButton } from '@/components/shared/SignOutButton';

// Mock data - will be replaced with real Supabase queries
const upcomingPickups = [
  {
    id: '1',
    date: 'Tomorrow',
    time: '10:00 AM - 12:00 PM',
    items: 3,
    status: 'confirmed',
  },
  {
    id: '2',
    date: 'Jan 5, 2025',
    time: '2:00 PM - 4:00 PM',
    items: 2,
    status: 'scheduled',
  },
];

const recentActivity = [
  {
    id: '1',
    description: 'Amazon return dropped off at UPS',
    date: 'Dec 28, 2024',
    status: 'completed',
  },
  {
    id: '2',
    description: 'Pickup completed - 4 items',
    date: 'Dec 28, 2024',
    status: 'completed',
  },
  {
    id: '3',
    description: 'Nordstrom return dropped off at FedEx',
    date: 'Dec 21, 2024',
    status: 'completed',
  },
];

export default async function CustomerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get user's active subscription with plan details
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select(`
      id,
      status,
      current_period_end,
      cancelled_at,
      paused_at,
      plan_id
    `)
    .eq('user_id', user.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get plan details if subscription exists
  let planDetails: { name: string; price: number } | null = null;
  if (subscriptionData?.plan_id) {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('name, price')
      .eq('id', subscriptionData.plan_id)
      .single();
    planDetails = plan;
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there';

  // Format subscription for component
  const subscription = subscriptionData
    ? {
        id: subscriptionData.id,
        status: subscriptionData.status as 'active' | 'paused' | 'cancelled' | 'expired',
        planName: planDetails?.name || 'Unknown Plan',
        planPrice: planDetails?.price || 0,
        currentPeriodEnd: subscriptionData.current_period_end,
        cancelledAt: subscriptionData.cancelled_at,
        pausedAt: subscriptionData.paused_at,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {displayName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/schedule-pickup">
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Pickup
                </Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2563eb]/10">
                  <Calendar className="h-6 w-6 text-[#2563eb]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Pickup</p>
                  <p className="text-lg font-semibold text-gray-900">Tomorrow</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#10b981]/10">
                  <Package className="h-6 w-6 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items This Month</p>
                  <p className="text-lg font-semibold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          <SubscriptionStatus subscription={subscription} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Pickups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Pickups</CardTitle>
              <Link href="/pickups" className="text-sm text-[#2563eb] hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingPickups.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPickups.map((pickup) => (
                    <div
                      key={pickup.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb]/10">
                          <Truck className="h-5 w-5 text-[#2563eb]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pickup.date}</p>
                          <p className="text-sm text-gray-500">{pickup.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={pickup.status === 'confirmed' ? 'secondary' : 'outline'}>
                          {pickup.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">{pickup.items} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming pickups</p>
                  <Link href="/schedule-pickup">
                    <Button variant="outline" size="sm" className="mt-4">
                      Schedule Now
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Link href="/history" className="text-sm text-[#2563eb] hover:underline flex items-center gap-1">
                View history <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981]/10 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-[#10b981]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
