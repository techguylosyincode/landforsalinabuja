import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    console.log("Verify email API: token =", token);
    console.log("Verify email API: email =", email);

    if (!token || !email) {
      console.log("Verify email API: Missing token or email");
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    console.log("Verify email API: Looking up user by email");
    // Find user by email in auth
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    console.log("Verify email API: User found:", user?.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Check if verification token exists and matches in profiles table
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, verification_token, verification_token_created_at')
      .eq('id', user.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 400 }
      );
    }

    // Check if token matches
    if (profile.verification_token !== token) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired (24 hours)
    if (profile.verification_token_created_at) {
      const tokenCreatedAt = new Date(profile.verification_token_created_at);
      const now = new Date();
      const hoursElapsed = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed > 24) {
        return NextResponse.json(
          { error: 'Verification token has expired. Please request a new one.' },
          { status: 400 }
        );
      }
    }

    // Mark email as verified
    console.log("Verify email API: Updating profile to mark email as verified");
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_created_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Verify email API: Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    console.log("Verify email API: Email verified successfully for user:", user.id);
    return NextResponse.json(
      { success: true, message: 'Email verified successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email API: Catch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
