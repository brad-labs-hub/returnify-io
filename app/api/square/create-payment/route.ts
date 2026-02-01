import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateSquareCustomer } from '@/lib/square/customers';
import { createPayment, calculatePickupPrice } from '@/lib/square/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, itemCount, pickupId } = body;

    if (!sourceId || typeof itemCount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sourceId and itemCount' },
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
      .select('full_name, phone')
      .eq('id', user.id)
      .single();

    // Calculate price
    const amount = calculatePickupPrice(itemCount);

    // Get or create Square customer
    const customerResult = await getOrCreateSquareCustomer(
      user.id,
      user.email!,
      profile?.full_name,
      profile?.phone
    );

    const customerId = customerResult.success ? customerResult.data?.id : undefined;

    // Create payment
    const paymentResult = await createPayment(
      user.id,
      sourceId,
      amount,
      customerId,
      pickupId,
      `Returnify pickup - ${itemCount} item${itemCount === 1 ? '' : 's'}`
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: paymentResult.data,
      amount,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
