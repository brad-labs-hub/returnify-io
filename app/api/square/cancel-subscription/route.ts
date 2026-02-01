import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription } from '@/lib/square/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Missing subscriptionId' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the subscription belongs to the user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, square_subscription_id')
      .eq('user_id', user.id)
      .eq('id', subscriptionId)
      .single();

    if (!subscription || !subscription.square_subscription_id) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Cancel subscription in Square
    const result = await cancelSubscription(subscription.square_subscription_id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
