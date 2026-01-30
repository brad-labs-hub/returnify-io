# Returnify

A modern return pickup service that picks up your returns and drops them off at UPS, USPS, or FedEx. Currently serving Greenwich, Stamford, and Darien, CT.

## Features

- Schedule return pickups with flexible time windows
- Support for all major carriers (UPS, USPS, FedEx)
- Multiple subscription plans (Bi-Weekly, Weekly, Premium)
- One-off pickup service available
- Real-time tracking and notifications
- Customer and Admin dashboards

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account (for database and authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd returnify-io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
returnify-io/
├── app/
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── (customer)/       # Customer dashboard and scheduling
│   ├── (admin)/          # Admin dashboard
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── landing/          # Landing page sections
│   ├── layout/           # Layout components (Header, Navigation)
│   └── shared/           # Shared components
├── lib/
│   ├── supabase/         # Supabase client utilities
│   └── utils.ts          # Utility functions
├── types/
│   └── database.types.ts # TypeScript type definitions
└── public/               # Static assets
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for callbacks) |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Pricing Plans

| Plan | Price | Frequency | Items |
|------|-------|-----------|-------|
| Bi-Weekly | $24.99/mo | Every 2 weeks | Up to 5 |
| Weekly | $39.99/mo | Every week | Up to 10 |
| Premium | $59.99/mo | 2x weekly | Unlimited |
| One-Off | $15 + $3/item | On-demand | Any |

## Service Area

Currently serving:
- Greenwich, CT
- Stamford, CT
- Darien, CT

## License

Private - All rights reserved.
