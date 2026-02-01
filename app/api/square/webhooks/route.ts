import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, processWebhook } from '@/lib/square/webhooks';
import type { SquareWebhookEvent } from '@/types/square.types';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature') || '';

    // Get the webhook URL (needed for signature verification)
    const webhookUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/square/webhooks`
      : request.url;

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature, webhookUrl)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the event
    const event: SquareWebhookEvent = JSON.parse(rawBody);

    // Process the webhook
    const result = await processWebhook(event);

    if (!result.success) {
      console.error('Webhook processing failed:', result.message);
      // Still return 200 to prevent retries for processing errors
      return NextResponse.json({ received: true, processed: false });
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent infinite retries
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

// Square sends a HEAD request to verify webhook URL
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
