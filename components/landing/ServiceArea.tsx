'use client';

import { MapPin, CheckCircle } from 'lucide-react';

const areas = [
  { name: 'Greenwich', available: true },
  { name: 'Stamford', available: true },
  { name: 'Darien', available: true },
];

export function ServiceArea() {
  return (
    <section id="service-area" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#2563eb]/5 to-[#10b981]/5 border border-gray-100 overflow-hidden">
              {/* Stylized map representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Connecticut outline representation */}
                  <div className="w-64 h-48 bg-[#2563eb]/10 rounded-3xl relative">
                    {/* Service area markers */}
                    {[
                      { name: 'Greenwich', top: '60%', left: '20%' },
                      { name: 'Stamford', top: '50%', left: '45%' },
                      { name: 'Darien', top: '40%', left: '70%' },
                    ].map((city) => (
                      <div
                        key={city.name}
                        className="absolute flex flex-col items-center"
                        style={{ top: city.top, left: city.left }}
                      >
                        <div className="w-4 h-4 bg-[#10b981] rounded-full animate-pulse shadow-lg" />
                        <span className="mt-1 text-xs font-medium text-gray-700 whitespace-nowrap">
                          {city.name}
                        </span>
                      </div>
                    ))}

                    {/* Decorative elements */}
                    <div className="absolute top-2 right-2 text-xs text-gray-400 font-medium">
                      Fairfield County, CT
                    </div>
                  </div>
                </div>
              </div>

              {/* Map-like grid lines */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full" style={{
                  backgroundImage: `
                    linear-gradient(to right, #2563eb 1px, transparent 1px),
                    linear-gradient(to bottom, #2563eb 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <MapPin className="h-4 w-4" />
              Now Serving
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Service Area
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              Currently serving select communities in Fairfield County, Connecticut.
              We&apos;re expanding soon!
            </p>

            <div className="mt-8 space-y-4">
              {areas.map((area) => (
                <div
                  key={area.name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <CheckCircle className="h-6 w-6 text-[#10b981]" />
                  <div>
                    <span className="font-semibold text-gray-900">{area.name}</span>
                    <span className="text-gray-500">, CT</span>
                  </div>
                  <span className="ml-auto text-sm font-medium text-[#10b981]">
                    Available
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Not in our service area?{' '}
              <a href="mailto:expand@returnify.io" className="text-[#2563eb] hover:underline font-medium">
                Let us know
              </a>{' '}
              and we&apos;ll notify you when we expand to your area.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
