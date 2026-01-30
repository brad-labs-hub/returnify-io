'use client';

import { MapPin, CheckCircle } from 'lucide-react';

const areas = [
  { name: 'Greenwich', available: true },
  { name: 'Stamford', available: true },
  { name: 'Darien', available: true },
];

// Service area markers with coordinates positioned on the map
const markers = [
  { name: 'Greenwich', top: '58%', left: '25%' },
  { name: 'Stamford', top: '48%', left: '48%' },
  { name: 'Darien', top: '42%', left: '68%' },
];

export function ServiceArea() {
  // OpenStreetMap static tile centered on Fairfield County, CT
  // Using Mapbox static API (free tier) - centered on Stamford area
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-73.5387,41.0792,10.5,0/600x450@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;

  // Fallback to OpenStreetMap tiles via iframe if needed
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-73.75%2C40.95%2C-73.35%2C41.15&layer=mapnik`;

  return (
    <section id="service-area" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map with real background */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              {/* Real map background using iframe */}
              <iframe
                src={osmEmbedUrl}
                className="absolute inset-0 w-full h-full border-0"
                style={{ filter: 'saturate(0.8) brightness(1.05)' }}
                loading="lazy"
                title="Service Area Map"
              />

              {/* Overlay for markers */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Semi-transparent overlay to make markers pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />

                {/* Service area markers */}
                {markers.map((city) => (
                  <div
                    key={city.name}
                    className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: city.top, left: city.left }}
                  >
                    {/* Pulse ring */}
                    <div className="absolute w-8 h-8 bg-[#10b981]/30 rounded-full animate-ping" />
                    {/* Marker dot */}
                    <div className="relative w-5 h-5 bg-[#10b981] rounded-full shadow-lg border-2 border-white" />
                    {/* Label */}
                    <div className="mt-2 px-2 py-1 bg-white/95 rounded-md shadow-md">
                      <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {city.name}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Service area badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                  <span className="text-xs font-semibold text-gray-600">Fairfield County, CT</span>
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
