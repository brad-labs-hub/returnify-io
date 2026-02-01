import { paymentsApi, refundsApi, squareLocationId, generateIdempotencyKey, dollarsToCents, centsToDollars } from './client';
import { createClient } from '@/lib/supabase/server';
import type { SquarePayment, SquareApiResponse } from '@/types/square.types';

// Create a one-time payment
export async function createPayment(
  userId: string,
  sourceId: string, // Token from Web Payments SDK
  amountInDollars: number,
  customerId?: string,
  pickupId?: string,
  note?: string
): Promise<SquareApiResponse<SquarePayment & { dbPaymentId: string }>> {
  try {
    const response = await paymentsApi.create({
      idempotencyKey: generateIdempotencyKey(),
      sourceId,
      amountMoney: {
        amount: dollarsToCents(amountInDollars),
        currency: 'USD',
      },
      locationId: squareLocationId,
      customerId,
      note: note || 'Returnify pickup payment',
      autocomplete: true, // Automatically complete the payment
    });

    if (response.payment) {
      const payment = response.payment;

      // Save payment to Supabase
      const supabase = await createClient();
      const { data: dbPayment, error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          pickup_id: pickupId,
          square_payment_id: payment.id,
          amount: amountInDollars,
          currency: 'USD',
          status: payment.status?.toLowerCase() === 'completed' ? 'completed' : 'pending',
          payment_type: 'one_off',
          card_brand: payment.cardDetails?.card?.cardBrand,
          card_last_four: payment.cardDetails?.card?.last4,
          receipt_url: payment.receiptUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save payment to database:', error);
      }

      // Update pickup payment status if pickup ID provided
      if (pickupId && payment.status === 'COMPLETED') {
        await supabase
          .from('pickups')
          .update({
            payment_id: dbPayment?.id,
            payment_status: 'paid',
          })
          .eq('id', pickupId);
      }

      return {
        success: true,
        data: {
          id: payment.id!,
          dbPaymentId: dbPayment?.id || '',
          status: payment.status as SquarePayment['status'],
          amountMoney: {
            amount: centsToDollars(payment.amountMoney?.amount),
            currency: payment.amountMoney?.currency || 'USD',
          },
          sourceType: payment.sourceType,
          cardDetails: payment.cardDetails
            ? {
                card: {
                  id: payment.cardDetails.card?.id || '',
                  cardBrand: payment.cardDetails.card?.cardBrand,
                  last4: payment.cardDetails.card?.last4,
                  expMonth: payment.cardDetails.card?.expMonth
                    ? Number(payment.cardDetails.card.expMonth)
                    : undefined,
                  expYear: payment.cardDetails.card?.expYear
                    ? Number(payment.cardDetails.card.expYear)
                    : undefined,
                },
              }
            : undefined,
          receiptUrl: payment.receiptUrl,
          createdAt: payment.createdAt,
        },
      };
    }

    return {
      success: false,
      error: 'Payment failed',
    };
  } catch (error: unknown) {
    console.error('Square createPayment error:', error);
    const apiError = error as { errors?: Array<{ detail: string; code: string }> };

    // Handle specific error codes
    const errorDetail = apiError.errors?.[0]?.detail || 'Payment failed';
    const errorCode = apiError.errors?.[0]?.code;

    let userFriendlyMessage = errorDetail;
    if (errorCode === 'CARD_DECLINED') {
      userFriendlyMessage = 'Your card was declined. Please try a different card.';
    } else if (errorCode === 'INVALID_CARD') {
      userFriendlyMessage = 'Invalid card details. Please check and try again.';
    } else if (errorCode === 'CARD_EXPIRED') {
      userFriendlyMessage = 'Your card has expired. Please use a different card.';
    }

    return {
      success: false,
      error: userFriendlyMessage,
    };
  }
}

// Get payment details
export async function getPayment(
  paymentId: string
): Promise<SquareApiResponse<SquarePayment>> {
  try {
    const response = await paymentsApi.get({ paymentId });

    if (response.payment) {
      const payment = response.payment;
      return {
        success: true,
        data: {
          id: payment.id!,
          status: payment.status as SquarePayment['status'],
          amountMoney: {
            amount: centsToDollars(payment.amountMoney?.amount),
            currency: payment.amountMoney?.currency || 'USD',
          },
          receiptUrl: payment.receiptUrl,
          createdAt: payment.createdAt,
        },
      };
    }

    return {
      success: false,
      error: 'Payment not found',
    };
  } catch (error: unknown) {
    console.error('Square getPayment error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to get payment',
    };
  }
}

// Refund a payment
export async function refundPayment(
  paymentId: string,
  amountInDollars?: number, // Optional partial refund amount
  reason?: string
): Promise<SquareApiResponse<{ refundId: string }>> {
  try {
    // Get the original payment to get the amount if not specified
    const originalPayment = await paymentsApi.get({ paymentId });
    const refundAmount = amountInDollars
      ? dollarsToCents(amountInDollars)
      : originalPayment.payment?.amountMoney?.amount;

    if (!refundAmount) {
      return {
        success: false,
        error: 'Could not determine refund amount',
      };
    }

    const response = await refundsApi.refundPayment({
      idempotencyKey: generateIdempotencyKey(),
      paymentId,
      amountMoney: {
        amount: refundAmount,
        currency: 'USD',
      },
      reason,
    });

    if (response.refund) {
      // Update payment status in Supabase
      const supabase = await createClient();
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('square_payment_id', paymentId);

      return {
        success: true,
        data: { refundId: response.refund.id! },
      };
    }

    return {
      success: false,
      error: 'Refund failed',
    };
  } catch (error: unknown) {
    console.error('Square refundPayment error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to refund payment',
    };
  }
}

// Calculate pickup price
export function calculatePickupPrice(itemCount: number): number {
  const BASE_PRICE = 15;
  const PER_ITEM_PRICE = 3;
  return BASE_PRICE + itemCount * PER_ITEM_PRICE;
}
