'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SquarePaymentForm } from './SquarePaymentForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
}

interface SubscriptionCheckoutProps {
  plan: SubscriptionPlan;
  onBack?: () => void;
}

export function SubscriptionCheckout({ plan, onBack }: SubscriptionCheckoutProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePaymentSuccess = async (token: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/square/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          sourceId: token,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      setSuccess(true);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome to {plan.name}!
          </h2>
          <p className="text-gray-600 mb-4">
            Your subscription is now active. Redirecting to your dashboard...
          </p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <CardTitle>Subscribe to {plan.name}</CardTitle>
        <CardDescription>
          ${plan.price.toFixed(2)}/month - Cancel anytime
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{plan.name} Plan</h3>
          {plan.description && (
            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
          )}
          {plan.features && plan.features.length > 0 && (
            <ul className="space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Payment Form */}
        <SquarePaymentForm
          amount={plan.price}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          buttonText="Subscribe"
          isProcessing={isProcessing}
        />

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to our Terms of Service and authorize us to charge
          your card ${plan.price.toFixed(2)} monthly until you cancel.
        </p>
      </CardContent>
    </Card>
  );
}
