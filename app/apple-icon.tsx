import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e293b',
          borderRadius: '22px',
        }}
      >
        <svg
          width="120"
          height="120"
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
    ),
    { ...size }
  );
}
