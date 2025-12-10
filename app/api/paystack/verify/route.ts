import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";

// Replace with your actual Paystack Secret Key
// For testing, use a test key: sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const PAYSTACK_SECRET_KEY = "sk_test_2566663f40d9695779ad51331aaa6156f51fe7af";

export async function POST(request: Request) {
    try {
        const { reference, userId } = await request.json();

        if (!reference || !userId) {
            return NextResponse.json({ error: "Missing reference or userId" }, { status: 400 });
        }

        // Verify transaction with Paystack
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.status || verifyData.data.status !== "success") {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // Payment successful, update user subscription
        const supabase = createClient();

        // Calculate expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: 'premium',
                subscription_expiry: expiryDate.toISOString(),
                is_verified: true // Optional: Auto-verify paying users? Or keep separate.
            })
            .eq('id', userId);

        if (error) {
            console.error("Database update error:", error);
            return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
