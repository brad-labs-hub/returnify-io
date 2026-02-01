'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  XCircle,
  Settings,
  Loader2,
} from 'lucide-react';

interface SubscriptionStatusProps {
  subscription: {
    id: string;
    status: 'active' | 'paused' | 'cancelled' | 'expired';
    planName: string;
    planPrice: number;
    currentPeriodEnd?: string;
    cancelledAt?: string;
    pausedAt?: string;
  } | null;
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No Active Subscription</h3>
            <p className="text-sm text-gray-500 mb-4">
              Subscribe to enjoy unlimited pickups
            </p>
            <Link href="/#pricing">
              <Button variant="primary" size="sm">
                View Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    active: {
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
      label: 'Active',
    },
    paused: {
      color: 'bg-yellow-100 text-yellow-700',
      icon: Pause,
      label: 'Paused',
    },
    cancelled: {
      color: 'bg-red-100 text-red-700',
      icon: XCircle,
      label: 'Cancelled',
    },
    expired: {
      color: 'bg-gray-100 text-gray-700',
      icon: AlertCircle,
      label: 'Expired',
    },
  };

  const status = statusConfig[subscription.status];
  const StatusIcon = status.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{subscription.planName}</h3>
            <p className="text-sm text-gray-500">
              ${subscription.planPrice.toFixed(2)}/month
            </p>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          {subscription.status === 'active' && subscription.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Next billing: {formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          )}

          {subscription.status === 'paused' && subscription.pausedAt && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <Pause className="h-4 w-4" />
              <span>Paused on {formatDate(subscription.pausedAt)}</span>
            </div>
          )}

          {subscription.status === 'cancelled' && subscription.cancelledAt && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              <span>Cancelled on {formatDate(subscription.cancelledAt)}</span>
            </div>
          )}
        </div>

        <Link href="/subscription">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
