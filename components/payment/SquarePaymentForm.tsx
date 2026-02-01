'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<Payments>;
    };
  }
}

interface Payments {
  card: () => Promise<Card>;
}

interface Card {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<TokenizeResult>;
  destroy: () => Promise<void>;
}

interface TokenizeResult {
  status: 'OK' | 'ERROR';
  token?: string;
  errors?: Array<{ message: string }>;
}

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (token: string) => void;
  onPaymentError: (error: string) => void;
  buttonText?: string;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function SquarePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  buttonText = 'Pay Now',
  disabled = false,
  isProcessing = false,
}: SquarePaymentFormProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTokenizing, setIsTokenizing] = useState(false);

  const initializeSquare = useCallback(async () => {
    if (!window.Square) {
      setError('Square SDK not loaded');
      setIsLoading(false);
      return;
    }

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

    if (!appId || !locationId) {
      setError('Square configuration missing');
      setIsLoading(false);
      return;
    }

    try {
      const payments = await window.Square.payments(appId, locationId);
      const card = await payments.card();
      await card.attach('#card-container');
      cardRef.current = card;
      setIsLoading(false);
    } catch (err) {
      console.error('Square initialization error:', err);
      setError('Failed to initialize payment form');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    const isSandbox = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT !== 'production';
    script.src = isSandbox
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = initializeSquare;
    script.onerror = () => {
      setError('Failed to load payment SDK');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (cardRef.current) {
        cardRef.current.destroy().catch(console.error);
      }
      document.body.removeChild(script);
    };
  }, [initializeSquare]);

  const handlePayment = async () => {
    if (!cardRef.current || isTokenizing) return;

    setIsTokenizing(true);
    setError(null);

    try {
      const result = await cardRef.current.tokenize();

      if (result.status === 'OK' && result.token) {
        onPaymentSuccess(result.token);
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Payment failed';
        setError(errorMessage);
        onPaymentError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsTokenizing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Input Container */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div
          id="card-container"
          ref={cardContainerRef}
          className="min-h-[50px] p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#2563eb] focus-within:border-transparent"
        >
          {isLoading && (
            <div className="flex items-center justify-center py-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading payment form...
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Amount Display */}
      <div className="flex justify-between items-center py-3 border-t border-gray-200">
        <span className="text-gray-600">Total</span>
        <span className="text-xl font-bold text-gray-900">
          ${amount.toFixed(2)}
        </span>
      </div>

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading || isTokenizing || isProcessing}
        className="w-full"
        size="lg"
      >
        {isTokenizing || isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {buttonText} - ${amount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-center text-gray-500">
        Payments are securely processed by Square. Your card details are never stored on our servers.
      </p>
    </div>
  );
}
