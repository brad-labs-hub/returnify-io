import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncSubscriptionPlans } from '@/lib/square/catalog';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user and check if admin
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Sync subscription plans to Square
    const result = await syncSubscriptionPlans();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: result.data,
      message: `Synced ${result.data?.length || 0} subscription plans to Square`,
    });
  } catch (error) {
    console.error('Sync plans error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync plans' },
      { status: 500 }
    );
  }
}
