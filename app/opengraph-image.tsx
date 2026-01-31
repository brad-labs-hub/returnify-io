import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Returnify - Never Deal With Returns Again';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #ecfdf5 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M28 16H16.83L20.41 12.41L19 11L13 17L19 23L20.41 21.59L16.83 18H28V16Z"
                fill="#10b981"
              />
              <path
                d="M12 28H28V20H26V26H12V14H18V12H12C10.9 12 10 12.9 10 14V26C10 27.1 10.9 28 12 28Z"
                fill="#10b981"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            Returnify
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#64748b',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Never Deal With Returns Again
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: '#94a3b8',
            marginTop: 20,
          }}
        >
          We pick up. We drop off. You relax.
        </div>
      </div>
    ),
    { ...size }
  );
}
