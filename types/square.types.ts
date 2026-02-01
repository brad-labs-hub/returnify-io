// Square-specific types for Returnify

export interface SquareCustomer {
  id: string;
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface SquareCard {
  id: string;
  cardBrand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
}

export interface SquareSubscription {
  id: string;
  customerId: string;
  planVariationId: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELED' | 'DEACTIVATED' | 'PAUSED';
  startDate?: string;
  chargedThroughDate?: string;
  canceledDate?: string;
  cardId?: string;
}

export interface SquarePayment {
  id: string;
  status: 'APPROVED' | 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED';
  amountMoney?: {
    amount: number;
    currency: string;
  };
  sourceType?: string;
  cardDetails?: {
    card?: SquareCard;
  };
  receiptUrl?: string;
  createdAt?: string;
}

export interface SquareCatalogSubscriptionPlan {
  id: string;
  name: string;
  phases: {
    cadence: 'WEEKLY' | 'EVERY_TWO_WEEKS' | 'MONTHLY' | 'EVERY_TWO_MONTHS' | 'QUARTERLY' | 'EVERY_FOUR_MONTHS' | 'EVERY_SIX_MONTHS' | 'ANNUAL' | 'EVERY_TWO_YEARS';
    recurringPriceMoney: {
      amount: number;
      currency: string;
    };
  }[];
}

export interface SquareWebhookEvent {
  merchantId: string;
  type: string;
  eventId: string;
  createdAt: string;
  data: {
    type: string;
    id: string;
    object: Record<string, unknown>;
  };
}

// Payment form types
export interface PaymentFormData {
  sourceId: string; // Payment token from Square Web Payments SDK
  verificationToken?: string; // SCA verification token
  customerId?: string;
}

export interface CreatePaymentRequest {
  sourceId: string;
  amount: number; // In dollars
  customerId?: string;
  pickupId?: string;
  note?: string;
}

export interface CreateSubscriptionRequest {
  planId: string; // From our database
  sourceId: string; // Card token
  customerId?: string;
}

// API Response types
export interface SquareApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{
    category: string;
    code: string;
    detail: string;
  }>;
}

// Subscription plan mapping (our DB to Square)
export interface SubscriptionPlanMapping {
  dbPlanId: string;
  dbPlanName: string;
  squareCatalogObjectId: string;
  squarePlanVariationId: string;
  priceInCents: number;
  cadence: 'MONTHLY';
}
