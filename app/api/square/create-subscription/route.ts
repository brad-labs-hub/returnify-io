import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateSquareCustomer } from '@/lib/square/customers';
import { createCardOnFile, createSubscription } from '@/lib/square/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, sourceId } = body;

    if (!planId || !sourceId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: planId and sourceId' },
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, square_customer_id')
      .eq('id', user.id)
      .single();

    // Get or create Square customer
    const customerResult = await getOrCreateSquareCustomer(
      user.id,
      user.email!,
      profile?.full_name,
      profile?.phone
    );

    if (!customerResult.success || !customerResult.data) {
      return NextResponse.json(
        { success: false, error: customerResult.error || 'Failed to create customer' },
        { status: 400 }
      );
    }

    const customerId = customerResult.data.id;

    // Create card on file
    const cardResult = await createCardOnFile(customerId, sourceId);

    if (!cardResult.success || !cardResult.data) {
      return NextResponse.json(
        { success: false, error: cardResult.error || 'Failed to save card' },
        { status: 400 }
      );
    }

    const cardId = cardResult.data.cardId;

    // Create subscription
    const subscriptionResult = await createSubscription(
      user.id,
      customerId,
      planId,
      cardId
    );

    if (!subscriptionResult.success) {
      return NextResponse.json(
        { success: false, error: subscriptionResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: subscriptionResult.data,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
