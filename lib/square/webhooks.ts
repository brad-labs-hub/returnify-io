import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import type { SquareWebhookEvent } from '@/types/square.types';

// Verify Square webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

  if (!signatureKey) {
    console.error('SQUARE_WEBHOOK_SIGNATURE_KEY not configured');
    return false;
  }

  // Square uses the URL + payload for signature
  const signatureBase = webhookUrl + payload;
  const expectedSignature = crypto
    .createHmac('sha256', signatureKey)
    .update(signatureBase)
    .digest('base64');

  return signature === expectedSignature;
}

// Check if webhook event has already been processed (idempotency)
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('square_webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

  return !!data;
}

// Mark event as processed
export async function markEventProcessed(
  eventId: string,
  eventType: string,
  payload: SquareWebhookEvent
): Promise<void> {
  const supabase = await createClient();
  await supabase.from('square_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    payload,
  });
}

// Process subscription webhook events
export async function processSubscriptionEvent(
  event: SquareWebhookEvent
): Promise<void> {
  const supabase = await createClient();
  const subscription = event.data.object as {
    id?: string;
    status?: string;
    canceled_date?: string;
  };

  if (!subscription.id) return;

  switch (event.type) {
    case 'subscription.created':
      // Subscription already created in our flow, but update status if needed
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('square_subscription_id', subscription.id);
      break;

    case 'subscription.updated':
      // Update subscription status
      const statusMap: Record<string, string> = {
        ACTIVE: 'active',
        PAUSED: 'paused',
        CANCELED: 'cancelled',
        DEACTIVATED: 'expired',
        PENDING: 'active',
      };
      await supabase
        .from('subscriptions')
        .update({
          status: statusMap[subscription.status || ''] || 'active',
        })
        .eq('square_subscription_id', subscription.id);
      break;

    case 'subscription.paused':
      await supabase
        .from('subscriptions')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
        })
        .eq('square_subscription_id', subscription.id);
      break;

    case 'subscription.resumed':
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          paused_at: null,
        })
        .eq('square_subscription_id', subscription.id);
      break;

    case 'subscription.canceled':
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: subscription.canceled_date || new Date().toISOString(),
        })
        .eq('square_subscription_id', subscription.id);
      break;

    default:
      console.log(`Unhandled subscription event type: ${event.type}`);
  }
}

// Process payment webhook events
export async function processPaymentEvent(
  event: SquareWebhookEvent
): Promise<void> {
  const supabase = await createClient();
  const payment = event.data.object as {
    id?: string;
    status?: string;
    receipt_url?: string;
  };

  if (!payment.id) return;

  switch (event.type) {
    case 'payment.completed':
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          receipt_url: payment.receipt_url,
        })
        .eq('square_payment_id', payment.id);

      // Also update pickup payment status if linked
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('pickup_id')
        .eq('square_payment_id', payment.id)
        .single();

      if (paymentRecord?.pickup_id) {
        await supabase
          .from('pickups')
          .update({ payment_status: 'paid' })
          .eq('id', paymentRecord.pickup_id);
      }
      break;

    case 'payment.failed':
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('square_payment_id', payment.id);
      break;

    case 'payment.canceled':
      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('square_payment_id', payment.id);
      break;

    default:
      console.log(`Unhandled payment event type: ${event.type}`);
  }
}

// Process invoice webhook events (for subscription payments)
export async function processInvoiceEvent(
  event: SquareWebhookEvent
): Promise<void> {
  const supabase = await createClient();
  const invoice = event.data.object as {
    id?: string;
    subscription_id?: string;
    status?: string;
  };

  if (!invoice.subscription_id) return;

  switch (event.type) {
    case 'invoice.payment_made':
      // Subscription payment successful - update period dates
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date().toISOString(),
        })
        .eq('square_subscription_id', invoice.subscription_id);
      break;

    case 'invoice.payment_failed':
      // Subscription payment failed - you might want to notify user
      console.log(
        `Subscription payment failed for ${invoice.subscription_id}`
      );
      // Could update status to 'past_due' or send notification
      break;

    default:
      console.log(`Unhandled invoice event type: ${event.type}`);
  }
}

// Main webhook processor
export async function processWebhook(
  event: SquareWebhookEvent
): Promise<{ success: boolean; message: string }> {
  try {
    // Check idempotency
    if (await isEventProcessed(event.eventId)) {
      return { success: true, message: 'Event already processed' };
    }

    // Process based on event type
    if (event.type.startsWith('subscription.')) {
      await processSubscriptionEvent(event);
    } else if (event.type.startsWith('payment.')) {
      await processPaymentEvent(event);
    } else if (event.type.startsWith('invoice.')) {
      await processInvoiceEvent(event);
    } else {
      console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Mark as processed
    await markEventProcessed(event.eventId, event.type, event);

    return { success: true, message: 'Event processed' };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { success: false, message: 'Processing failed' };
  }
}
