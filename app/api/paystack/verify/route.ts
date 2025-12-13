import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Replace with your actual Paystack Secret Key
const PAYSTACK_SECRET_KEY = "sk_test_2566663f40d9695779ad51331aaa6156f51fe7af";

export async function POST(request: Request) {
    try {
        const { reference, userId, tier, billingCycle } = await request.json();

        if (!reference || !userId) {
            return NextResponse.json({ error: "Missing reference or userId" }, { status: 400 });
        }

        // Verify transaction with Paystack
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        });

        if (!verifyRes.ok) {
            console.error("Paystack verify HTTP error:", verifyRes.status, verifyRes.statusText);
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        const verifyData = await verifyRes.json();
        const paystackStatus = verifyData?.data?.status;

        if (!verifyData?.status || paystackStatus !== "success") {
            console.warn("Paystack verification declined:", verifyData);
            return NextResponse.json({ error: "Payment declined or not successful" }, { status: 400 });
        }

        // Payment successful, update user subscription
        const supabase = await createClient();

        // Calculate expiry date based on billing cycle
        const expiryDate = new Date();
        if (billingCycle === 'annual') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setDate(expiryDate.getDate() + 30);
        }

        // Determine subscription tier (default to 'pro' for backward compatibility)
        const subscriptionTier = tier || 'pro';

        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: subscriptionTier,
                subscription_expiry: expiryDate.toISOString(),
                is_verified: true,
                verification_status: 'verified',
                verified_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            console.error("Database update error:", error);
            return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
        }

        return NextResponse.json({ success: true, tier: subscriptionTier, expiry: expiryDate.toISOString() });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
