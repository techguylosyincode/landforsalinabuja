import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { agentId, reason } = body;

    // Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Reject agent
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_status: 'rejected',
        verification_reason: reason || 'Verification rejected',
        is_verified: false,
      })
      .eq('id', agentId);

    if (updateError) {
      console.error('Rejection error:', updateError);
      return NextResponse.json({ error: 'Failed to reject agent' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Agent rejected successfully',
    }, { status: 200 });

  } catch (err) {
    console.error('Admin rejection error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
