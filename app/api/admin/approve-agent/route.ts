import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { agentId } = body;

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

    // Approve agent
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_status: 'verified',
        verification_reason: null,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        is_verified: true,
      })
      .eq('id', agentId);

    if (updateError) {
      console.error('Approval error:', updateError);
      return NextResponse.json({ error: 'Failed to approve agent' }, { status: 500 });
    }

    revalidatePath('/admin/agents');

    return NextResponse.json({
      success: true,
      message: 'Agent approved successfully',
    }, { status: 200 });

  } catch (err) {
    console.error('Admin approval error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
