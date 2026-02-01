'use client';

import { useState } from 'react';
import { SquarePaymentForm } from './SquarePaymentForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Package } from 'lucide-react';

interface OneOffCheckoutProps {
  itemCount: number;
  pickupId?: string;
  onPaymentSuccess: (paymentData: { paymentId: string; amount: number }) => void;
  onPaymentError?: (error: string) => void;
}

const BASE_PRICE = 15;
const PER_ITEM_PRICE = 3;

export function OneOffCheckout({
  itemCount,
  pickupId,
  onPaymentSuccess,
  onPaymentError,
}: OneOffCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = BASE_PRICE + itemCount * PER_ITEM_PRICE;

  const handlePaymentSuccess = async (token: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/square/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: token,
          itemCount,
          pickupId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      onPaymentSuccess({
        paymentId: data.payment.id,
        amount: data.amount,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    onPaymentError?.(errorMessage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payment</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base pickup fee</span>
            <span className="text-gray-900">${BASE_PRICE.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Items ({itemCount} × ${PER_ITEM_PRICE.toFixed(2)})
            </span>
            <span className="text-gray-900">
              ${(itemCount * PER_ITEM_PRICE).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {itemCount} item{itemCount !== 1 ? 's' : ''} for pickup
            </p>
            <p className="text-sm text-gray-600">
              One-time pickup service
            </p>
          </div>
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
          amount={totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          buttonText="Pay & Confirm Pickup"
          isProcessing={isProcessing}
        />

        {/* Benefits */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            We pick up from your door
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Dropped off at the right carrier
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Tracking confirmation provided
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
