import { SquareClient, SquareEnvironment } from 'square';

// Initialize Square client with environment-based configuration
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

export const customersApi = squareClient.customers;
export const subscriptionsApi = squareClient.subscriptions;
export const paymentsApi = squareClient.payments;
export const refundsApi = squareClient.refunds;
export const catalogApi = squareClient.catalog;
export const locationsApi = squareClient.locations;
export const cardsApi = squareClient.cards;

export const squareLocationId = process.env.SQUARE_LOCATION_ID!;
export const squareAppId = process.env.SQUARE_APPLICATION_ID!;

// Helper to convert BigInt to number for JSON serialization
export function bigIntToNumber(value: bigint | undefined): number {
  if (value === undefined) return 0;
  return Number(value);
}

// Helper to convert cents to dollars
export function centsToDollars(cents: bigint | number | null | undefined): number {
  if (cents === undefined || cents === null) return 0;
  return Number(cents) / 100;
}

// Helper to convert dollars to cents (for Square API)
export function dollarsToCents(dollars: number): bigint {
  return BigInt(Math.round(dollars * 100));
}

// Generate idempotency key for Square API calls
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
