'use client';

import { MapPin, CheckCircle } from 'lucide-react';
import Image from 'next/image';

const areas = [
  { name: 'Greenwich', available: true },
  { name: 'Stamford', available: true },
  { name: 'Darien', available: true },
];

// Service area markers positioned on the static map
const markers = [
  { name: 'Greenwich', top: '62%', left: '22%' },
  { name: 'Stamford', top: '52%', left: '50%' },
  { name: 'Darien', top: '45%', left: '72%' },
];

export function ServiceArea() {
  // Static map image from OpenStreetMap - Fairfield County area
  // Centered on Greenwich/Stamford/Darien area at zoom level showing just those towns
  const staticMapUrl = 'https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=450&center=lonlat:-73.54,41.05&zoom=11&apiKey=demo';

  return (
    <section id="service-area" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Static Map */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100">
              {/* Static map background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-73.54,41.05,10.8,0/600x450@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw')`,
                  filter: 'saturate(0.9) brightness(1.02)'
                }}
              />

              {/* Overlay for markers */}
              <div className="absolute inset-0">
                {/* Light overlay to make markers stand out */}
                <div className="absolute inset-0 bg-white/10" />

                {/* Service area markers */}
                {markers.map((city) => (
                  <div
                    key={city.name}
                    className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: city.top, left: city.left }}
                  >
                    {/* Pulse ring */}
                    <div className="absolute w-10 h-10 bg-[#10b981]/20 rounded-full animate-ping" />
                    {/* Outer ring */}
                    <div className="absolute w-7 h-7 bg-[#10b981]/30 rounded-full" />
                    {/* Marker dot */}
                    <div className="relative w-5 h-5 bg-[#10b981] rounded-full shadow-lg border-2 border-white" />
                    {/* Label */}
                    <div className="mt-2 px-3 py-1.5 bg-white rounded-lg shadow-lg border border-gray-100">
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {city.name}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Service area badge */}
                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100">
                  <span className="text-sm font-bold text-gray-700">Fairfield County, CT</span>
                </div>
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
