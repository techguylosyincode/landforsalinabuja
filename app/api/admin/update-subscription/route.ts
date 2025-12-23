import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { userId, subscriptionTier, subscriptionExpiry } = body;

    // Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Validate inputs
    if (!userId || !subscriptionTier) {
      return NextResponse.json({ error: 'Missing userId or subscriptionTier' }, { status: 400 });
    }

    const validTiers = ['starter', 'pro', 'premium', 'agency'];
    if (!validTiers.includes(subscriptionTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    // Validate expiry date if provided
    if (subscriptionExpiry) {
      const expiryDate = new Date(subscriptionExpiry);
      if (isNaN(expiryDate.getTime())) {
        return NextResponse.json({ error: 'Invalid expiry date' }, { status: 400 });
      }
      // Enforce future dates only
      if (expiryDate < new Date()) {
        return NextResponse.json({ error: 'Expiry date must be in the future' }, { status: 400 });
      }
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: subscriptionTier,
        subscription_expiry: subscriptionExpiry || null,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    }, { status: 200 });

  } catch (err) {
    console.error('Admin subscription update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
