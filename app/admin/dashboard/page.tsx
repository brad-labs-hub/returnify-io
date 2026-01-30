'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// Mock data - would come from Supabase
const stats = [
  { name: 'Total Users', value: '156', change: '+12%', icon: Users, color: 'blue' },
  { name: 'Active Subscriptions', value: '89', change: '+8%', icon: TrendingUp, color: 'green' },
  { name: 'Pickups Today', value: '12', change: '+3', icon: Package, color: 'amber' },
  { name: 'Revenue (MTD)', value: '$4,280', change: '+15%', icon: DollarSign, color: 'purple' },
];

const todayPickups = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    address: '123 Greenwich Ave, Greenwich',
    time: '10:00 AM',
    items: 3,
    status: 'in_progress',
  },
  {
    id: '2',
    customer: 'Michael Chen',
    address: '456 Stamford Rd, Stamford',
    time: '11:30 AM',
    items: 2,
    status: 'scheduled',
  },
  {
    id: '3',
    customer: 'Emily Davis',
    address: '789 Darien St, Darien',
    time: '2:00 PM',
    items: 5,
    status: 'scheduled',
  },
  {
    id: '4',
    customer: 'James Wilson',
    address: '321 Post Rd, Darien',
    time: '3:30 PM',
    items: 1,
    status: 'scheduled',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'secondary';
    case 'completed':
      return 'default';
    case 'scheduled':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'scheduled':
      return 'Scheduled';
    default:
      return status;
  }
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Overview of today&apos;s operations</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-[#10b981] mt-1">{stat.change} this month</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      stat.color === 'blue'
                        ? 'bg-[#2563eb]/10'
                        : stat.color === 'green'
                        ? 'bg-[#10b981]/10'
                        : stat.color === 'amber'
                        ? 'bg-[#f59e0b]/10'
                        : 'bg-purple-500/10'
                    }`}
                  >
                    <stat.icon
                      className={`h-5 w-5 ${
                        stat.color === 'blue'
                          ? 'text-[#2563eb]'
                          : stat.color === 'green'
                          ? 'text-[#10b981]'
                          : stat.color === 'amber'
                          ? 'text-[#f59e0b]'
                          : 'text-purple-500'
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Pickups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Today&apos;s Pickups</CardTitle>
            <Link href="/admin/pickups" className="text-sm text-[#2563eb] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayPickups.map((pickup) => (
                    <tr key={pickup.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{pickup.customer}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {pickup.address}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{pickup.time}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{pickup.items}</td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusColor(pickup.status) as 'default' | 'secondary' | 'outline'}>
                          {getStatusLabel(pickup.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
