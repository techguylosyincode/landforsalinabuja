import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, token, userId } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY in environment');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Store verification token in profiles table
    if (userId) {
      const supabase = createAdminClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_token: token,
          verification_token_created_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to store verification token:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
        });
        return NextResponse.json(
          { error: 'Failed to store verification token' },
          { status: 500 }
        );
      }
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const response = await resend.emails.send({
      from: 'Land For Sale in Abuja <noreply@landforsaleinabuja.ng>',
      to: email,
      subject: 'Verify Your Email - Land For Sale in Abuja',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

            <!-- Header with brand color -->
            <div style="background: linear-gradient(135deg, #003087 0%, #1e5a96 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Land For Sale in Abuja</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Nigeria's Premier Real Estate Platform</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Hello <strong>${fullName}</strong>,
              </p>

              <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #003087; margin-bottom: 30px; border-radius: 4px;">
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0;">
                  Thank you for registering with <strong>Land For Sale in Abuja</strong>! We're excited to help you find the perfect property or reach your ideal clients.
                </p>
              </div>

              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                To complete your registration and access all features, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${verificationUrl}"
                   style="display: inline-block; background-color: #003087; color: white; padding: 14px 50px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; transition: background-color 0.3s ease;">
                  ✓ Verify Email Address
                </a>
              </div>

              <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0;">
                Or copy and paste this link in your browser:
              </p>

              <div style="background-color: #f0f0f0; padding: 12px; border-radius: 4px; margin-bottom: 30px; word-break: break-all;">
                <p style="color: #003087; font-size: 12px; margin: 0; font-family: 'Courier New', monospace;">
                  ${verificationUrl}
                </p>
              </div>

              <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
                  <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create this account, please <a href="mailto:support@landforsaleinabuja.ng" style="color: #003087; text-decoration: none;">contact us</a> immediately.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">
                <strong>Land For Sale in Abuja</strong><br>
                Nigeria's Fastest Growing Real Estate Network
              </p>

              <div style="margin: 15px 0;">
                <a href="https://landforsaleinabuja.ng" style="color: #003087; text-decoration: none; font-size: 13px;">Visit Website</a>
                <span style="color: #ddd; margin: 0 10px;">•</span>
                <a href="mailto:support@landforsaleinabuja.ng" style="color: #003087; text-decoration: none; font-size: 13px;">Support</a>
                <span style="color: #ddd; margin: 0 10px;">•</span>
                <a href="https://landforsaleinabuja.ng/contact" style="color: #003087; text-decoration: none; font-size: 13px;">Contact</a>
              </div>

              <p style="color: #aaa; font-size: 11px; margin: 20px 0 0 0; line-height: 1.5;">
                © 2026 Land For Sale in Abuja. All rights reserved.<br>
                <a href="https://landforsaleinabuja.ng/privacy" style="color: #003087; text-decoration: none;">Privacy Policy</a> |
                <a href="https://landforsaleinabuja.ng/terms" style="color: #003087; text-decoration: none;">Terms of Service</a>
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Verification email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
