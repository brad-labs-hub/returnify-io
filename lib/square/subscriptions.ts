import { subscriptionsApi, cardsApi, squareLocationId, generateIdempotencyKey } from './client';
import { createClient } from '@/lib/supabase/server';
import { getPlanVariationId } from './catalog';
import type { SquareSubscription, SquareApiResponse } from '@/types/square.types';

// Create a card on file for the customer
export async function createCardOnFile(
  customerId: string,
  sourceId: string // Token from Web Payments SDK
): Promise<SquareApiResponse<{ cardId: string }>> {
  try {
    const response = await cardsApi.create({
      idempotencyKey: generateIdempotencyKey(),
      sourceId,
      card: {
        customerId,
      },
    });

    if (response.card) {
      return {
        success: true,
        data: { cardId: response.card.id! },
      };
    }

    return {
      success: false,
      error: 'Failed to save card',
    };
  } catch (error: unknown) {
    console.error('Square createCardOnFile error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to save card',
    };
  }
}

// Create a subscription
export async function createSubscription(
  userId: string,
  customerId: string,
  planId: string, // Our database plan ID
  cardId: string
): Promise<SquareApiResponse<SquareSubscription>> {
  try {
    // Get the Square plan variation ID
    const planVariationId = await getPlanVariationId(planId);
    if (!planVariationId) {
      return {
        success: false,
        error: 'Subscription plan not found or not synced with Square',
      };
    }

    const response = await subscriptionsApi.create({
      idempotencyKey: generateIdempotencyKey(),
      locationId: squareLocationId,
      customerId,
      planVariationId,
      cardId,
    });

    if (response.subscription) {
      const subscription = response.subscription;

      // Save subscription to Supabase
      const supabase = await createClient();
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_id: planId,
        status: subscription.status?.toLowerCase() || 'active',
        square_subscription_id: subscription.id,
        square_customer_id: customerId,
        square_plan_variation_id: planVariationId,
        current_period_start: subscription.startDate,
        current_period_end: subscription.chargedThroughDate,
      });

      return {
        success: true,
        data: {
          id: subscription.id!,
          customerId: subscription.customerId!,
          planVariationId: subscription.planVariationId!,
          status: subscription.status as SquareSubscription['status'],
          startDate: subscription.startDate,
          chargedThroughDate: subscription.chargedThroughDate,
          cardId: subscription.cardId ?? undefined,
        },
      };
    }

    return {
      success: false,
      error: 'Failed to create subscription',
    };
  } catch (error: unknown) {
    console.error('Square createSubscription error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to create subscription',
    };
  }
}

// Get subscription details
export async function getSubscription(
  subscriptionId: string
): Promise<SquareApiResponse<SquareSubscription>> {
  try {
    const response = await subscriptionsApi.get({ subscriptionId });

    if (response.subscription) {
      const subscription = response.subscription;
      return {
        success: true,
        data: {
          id: subscription.id!,
          customerId: subscription.customerId!,
          planVariationId: subscription.planVariationId!,
          status: subscription.status as SquareSubscription['status'],
          startDate: subscription.startDate,
          chargedThroughDate: subscription.chargedThroughDate,
          canceledDate: subscription.canceledDate ?? undefined,
          cardId: subscription.cardId ?? undefined,
        },
      };
    }

    return {
      success: false,
      error: 'Subscription not found',
    };
  } catch (error: unknown) {
    console.error('Square getSubscription error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to get subscription',
    };
  }
}

// Cancel a subscription
export async function cancelSubscription(
  subscriptionId: string
): Promise<SquareApiResponse<SquareSubscription>> {
  try {
    const response = await subscriptionsApi.cancel({ subscriptionId });

    if (response.subscription) {
      const subscription = response.subscription;

      // Update Supabase
      const supabase = await createClient();
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('square_subscription_id', subscriptionId);

      return {
        success: true,
        data: {
          id: subscription.id!,
          customerId: subscription.customerId!,
          planVariationId: subscription.planVariationId!,
          status: subscription.status as SquareSubscription['status'],
          canceledDate: subscription.canceledDate ?? undefined,
        },
      };
    }

    return {
      success: false,
      error: 'Failed to cancel subscription',
    };
  } catch (error: unknown) {
    console.error('Square cancelSubscription error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to cancel subscription',
    };
  }
}

// Pause a subscription
export async function pauseSubscription(
  subscriptionId: string
): Promise<SquareApiResponse<SquareSubscription>> {
  try {
    const response = await subscriptionsApi.pause({ subscriptionId });

    if (response.subscription) {
      const subscription = response.subscription;

      // Update Supabase
      const supabase = await createClient();
      await supabase
        .from('subscriptions')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
        })
        .eq('square_subscription_id', subscriptionId);

      return {
        success: true,
        data: {
          id: subscription.id!,
          customerId: subscription.customerId!,
          planVariationId: subscription.planVariationId!,
          status: subscription.status as SquareSubscription['status'],
        },
      };
    }

    return {
      success: false,
      error: 'Failed to pause subscription',
    };
  } catch (error: unknown) {
    console.error('Square pauseSubscription error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to pause subscription',
    };
  }
}

// Resume a paused subscription
export async function resumeSubscription(
  subscriptionId: string
): Promise<SquareApiResponse<SquareSubscription>> {
  try {
    const response = await subscriptionsApi.resume({ subscriptionId });

    if (response.subscription) {
      const subscription = response.subscription;

      // Update Supabase
      const supabase = await createClient();
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          paused_at: null,
        })
        .eq('square_subscription_id', subscriptionId);

      return {
        success: true,
        data: {
          id: subscription.id!,
          customerId: subscription.customerId!,
          planVariationId: subscription.planVariationId!,
          status: subscription.status as SquareSubscription['status'],
        },
      };
    }

    return {
      success: false,
      error: 'Failed to resume subscription',
    };
  } catch (error: unknown) {
    console.error('Square resumeSubscription error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to resume subscription',
    };
  }
}
