'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Bi-Weekly',
    price: 24.99,
    period: '/month',
    description: 'Perfect for occasional returners',
    features: [
      'Pickups every 2 weeks',
      'Up to 5 items per pickup',
      'Email & SMS notifications',
      'Standard pickup windows',
    ],
    isPopular: false,
    cta: 'Choose Plan',
  },
  {
    name: 'Weekly',
    price: 39.99,
    period: '/month',
    description: 'Our most popular plan',
    features: [
      'Pickups every week',
      'Up to 10 items per pickup',
      'Priority pickup windows',
      'Email & SMS notifications',
      'Flexible rescheduling',
    ],
    isPopular: true,
    cta: 'Choose Plan',
  },
  {
    name: 'Premium',
    price: 59.99,
    period: '/month',
    description: 'For power shoppers',
    features: [
      '2x weekly pickups',
      'Unlimited items',
      'Same-day pickup available',
      'Dedicated support',
      'Email & SMS notifications',
      'Priority scheduling',
    ],
    isPopular: false,
    cta: 'Choose Plan',
  },
];

const oneOff = {
  name: 'One-Off Service',
  description: 'Need a single pickup?',
  pricing: '$15 base + $3 per item',
  cta: 'Get Quote',
};

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose a plan that fits your lifestyle. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              highlight={plan.isPopular}
              className="relative flex flex-col"
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5 text-[#10b981]" />
                      </div>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.isPopular ? 'primary' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* One-Off Option */}
        <div className="mt-12 max-w-xl mx-auto">
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-gray-900">{oneOff.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {oneOff.description}
                  </p>
                  <p className="text-lg font-semibold text-[#2563eb] mt-2">
                    {oneOff.pricing}
                  </p>
                </div>
                <Link href="/schedule-pickup">
                  <Button variant="secondary" size="md">
                    {oneOff.cta}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
