'use client';

import { CalendarCheck, Truck, Bell } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: CalendarCheck,
    title: 'Schedule Your Pickup',
    description: 'Choose your plan and pickup time that works best for you. Set it and forget it with recurring pickups.',
  },
  {
    number: '02',
    icon: Truck,
    title: 'We Come to You',
    description: 'Leave your returns at your door or hand them off directly. No labels? No problem – we can print them for you.',
  },
  {
    number: '03',
    icon: Bell,
    title: 'Track Your Returns',
    description: 'Get real-time notifications when items are picked up and dropped off. Full visibility, zero hassle.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Returns made simple in three easy steps. No more trips to the post office.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#2563eb]/20 to-[#10b981]/20" />
              )}

              <div className="relative bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-[#2563eb]/20">
                {/* Step number */}
                <div className="absolute -top-4 left-8 bg-[#2563eb] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Step {step.number}
                </div>

                {/* Icon */}
                <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb]/10 to-[#10b981]/10 group-hover:from-[#2563eb]/20 group-hover:to-[#10b981]/20 transition-all duration-300">
                  <step.icon className="h-8 w-8 text-[#2563eb]" />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
