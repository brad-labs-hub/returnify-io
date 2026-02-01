'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { OneOffCheckout } from '@/components/payment/OneOffCheckout';
import {
  Package,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  CheckCircle,
  Loader2,
} from 'lucide-react';

type Carrier = 'ups' | 'usps' | 'fedex';

interface ReturnItem {
  id: string;
  description: string;
  carrier: Carrier;
  hasLabel: boolean;
}

const timeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
];

const carriers: { value: Carrier; label: string }[] = [
  { value: 'ups', label: 'UPS' },
  { value: 'usps', label: 'USPS' },
  { value: 'fedex', label: 'FedEx' },
];

export default function SchedulePickupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [items, setItems] = useState<ReturnItem[]>([
    { id: '1', description: '', carrier: 'ups', hasLabel: true },
  ]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', carrier: 'ups', hasLabel: true },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ReturnItem, value: string | boolean) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Generate next 7 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  };

  const handlePaymentSuccess = async (paymentData: { paymentId: string; amount: number }) => {
    setPaymentSuccess(true);
    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  // Calculate price
  const basePrice = 15;
  const perItemPrice = 3;
  const totalPrice = basePrice + items.length * perItemPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Schedule a Pickup</h1>
          <p className="text-gray-500 mt-1">Choose your date, time, add items, and pay.</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= s
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 ${
                    step > s ? 'bg-[#2563eb]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8 text-xs sm:text-sm text-gray-500">
          <div className="flex gap-6 sm:gap-12">
            <span className={step === 1 ? 'text-[#2563eb] font-medium' : ''}>Date/Time</span>
            <span className={step === 2 ? 'text-[#2563eb] font-medium' : ''}>Items</span>
            <span className={step === 3 ? 'text-[#2563eb] font-medium' : ''}>Review</span>
            <span className={step === 4 ? 'text-[#2563eb] font-medium' : ''}>Pay</span>
          </div>
        </div>

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#2563eb]" />
                Select Date & Time
              </CardTitle>
              <CardDescription>Choose when you want us to pick up your returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedDate === date.value
                          ? 'border-[#2563eb] bg-[#2563eb]/5 text-[#2563eb] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{date.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a time window
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedTime === slot
                          ? 'border-[#2563eb] bg-[#2563eb]/5 text-[#2563eb] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{slot}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add Items */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#2563eb]" />
                Add Return Items
              </CardTitle>
              <CardDescription>Tell us what you&apos;re returning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 rounded-lg border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="e.g., Amazon - Blue sweater"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Carrier</label>
                      <select
                        value={item.carrier}
                        onChange={(e) => updateItem(item.id, 'carrier', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-gray-900"
                      >
                        {carriers.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Return Label</label>
                      <select
                        value={item.hasLabel ? 'yes' : 'no'}
                        onChange={(e) => updateItem(item.id, 'hasLabel', e.target.value === 'yes')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none text-gray-900"
                      >
                        <option value="yes">I have a label</option>
                        <option value="no">No label (QR code)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addItem}
                className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Item
              </button>

              {/* Price Preview */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Total</span>
                  <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  $15 base + ${perItemPrice} × {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2563eb]" />
                Review Pickup Details
              </CardTitle>
              <CardDescription>Confirm everything looks correct</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-gray-50 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium text-gray-900">{items.length} package(s)</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Items to return</h4>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.description || `Item ${index + 1}`}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({item.carrier.toUpperCase()})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.hasLabel ? 'Has label' : 'QR code'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special instructions (optional)
                </label>
                <textarea
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., Leave packages by the front door"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none resize-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {step === 4 && !paymentSuccess && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="text-gray-900">{items.length} package(s)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <OneOffCheckout
              itemCount={items.length}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={(error) => console.error('Payment error:', error)}
            />

            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* Payment Success */}
        {step === 4 && paymentSuccess && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Pickup Scheduled!
              </h2>
              <p className="text-gray-600 mb-2">
                Your pickup is confirmed for{' '}
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at {selectedTime}.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                We&apos;ll send you a reminder before your pickup.
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
