import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Returnify - Never Deal With Returns Again',
  description:
    'We pick up your returns and drop them off at UPS, USPS, or FedEx. Serving Greenwich, Stamford, and Darien, CT.',
  keywords: ['returns', 'pickup service', 'UPS', 'USPS', 'FedEx', 'Greenwich', 'Stamford', 'Darien'],
  authors: [{ name: 'Returnify' }],
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Returnify - Never Deal With Returns Again',
    description: 'We pick up your returns and drop them off at UPS, USPS, or FedEx.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Returnify',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Returnify - Never Deal With Returns Again',
    description: 'We pick up your returns and drop them off at UPS, USPS, or FedEx.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
