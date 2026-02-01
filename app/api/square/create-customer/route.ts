import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateSquareCustomer } from '@/lib/square/customers';

export async function POST(request: NextRequest) {
  try {
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

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single();

    // Create or get existing Square customer
    const result = await getOrCreateSquareCustomer(
      user.id,
      user.email!,
      profile?.full_name,
      profile?.phone
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customerId: result.data?.id,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
