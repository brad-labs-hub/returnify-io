'use client';

import { Button } from '@/components/ui/button';
import { Package, Truck, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-16 sm:pt-28 sm:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#2563eb]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#10b981]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Never Deal With{' '}
              <span className="text-[#2563eb]">Returns</span> Again
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto lg:mx-0">
              We pick up your returns and drop them off at UPS, USPS, or FedEx.{' '}
              <span className="font-semibold text-gray-900">
                Serving Greenwich, Stamford, and Darien.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button size="xl" variant="primary">
                  Get Started
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="xl" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#10b981]" />
                <span>All major carriers</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#10b981]" />
                <span>Same-day available</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#10b981]" />
                <span>Local service</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative">
              {/* Main card illustration */}
              <div className="rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb]/10">
                    <Package className="h-6 w-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Next Pickup</p>
                    <p className="text-sm text-gray-500">Tomorrow, 10am - 12pm</p>
                  </div>
                </div>

                {/* Mock items */}
                <div className="space-y-3">
                  {[
                    { carrier: 'UPS', item: 'Amazon Return', status: 'Ready' },
                    { carrier: 'USPS', item: 'Nordstrom Package', status: 'Ready' },
                    { carrier: 'FedEx', item: 'Apple Store', status: 'Pending' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase w-12">
                          {item.carrier}
                        </span>
                        <span className="text-sm text-gray-700">{item.item}</span>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          item.status === 'Ready'
                            ? 'text-[#10b981]'
                            : 'text-[#f59e0b]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total items</span>
                    <span className="font-semibold text-gray-900">3 packages</span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 rounded-full bg-[#10b981] px-4 py-2 text-sm font-semibold text-white shadow-lg">
                Scheduled!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
