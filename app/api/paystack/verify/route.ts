import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Get Paystack Secret Key from environment variable
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY environment variable is not configured");
}

export async function POST(request: Request) {
    const supabase = await createClient();
    let transactionId: string | null = null;

    try {
        const { reference, userId, tier, billingCycle } = await request.json();

        if (!reference || !userId) {
            return NextResponse.json({ error: "Missing reference or userId" }, { status: 400 });
        }

        // Calculate subscription amount and expiry
        const subscriptionTier = tier || 'pro';
        const amount = subscriptionTier === 'pro' ? 5000 : 15000;
        const expiryDate = new Date();
        if (billingCycle === 'annual') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setDate(expiryDate.getDate() + 30);
        }

        // 1. Create pending transaction record first
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                reference,
                transaction_type: 'subscription',
                amount,
                currency: 'NGN',
                subscription_tier: subscriptionTier,
                billing_cycle: billingCycle || 'monthly',
                status: 'pending',
                gateway: 'paystack',
                ip_address: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip'),
                user_agent: request.headers.get('user-agent'),
            })
            .select()
            .single();

        if (txError) {
            console.error("Transaction creation error:", txError);
            return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 });
        }

        transactionId = transaction.id;

        // 2. Verify transaction with Paystack
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        });

        if (!verifyRes.ok) {
            console.error("Paystack verify HTTP error:", verifyRes.status, verifyRes.statusText);
            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        const verifyData = await verifyRes.json();
        const paystackStatus = verifyData?.data?.status;

        if (!verifyData?.status || paystackStatus !== "success") {
            console.warn("Paystack verification declined:", verifyData);
            await supabase
                .from('transactions')
                .update({
                    status: 'failed',
                    gateway_response: verifyData
                })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Payment declined or not successful" }, { status: 400 });
        }

        // 3. Verify amount matches
        const expectedAmount = amount * 100; // kobo
        if (verifyData.data.amount !== expectedAmount) {
            console.error("Amount mismatch. Expected:", expectedAmount, "Got:", verifyData.data.amount);
            await supabase
                .from('transactions')
                .update({
                    status: 'failed',
                    gateway_response: verifyData
                })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
        }

        // 4. Payment successful, update user subscription
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: subscriptionTier,
                subscription_expiry: expiryDate.toISOString(),
                is_verified: true,
                verification_status: 'verified',
                verified_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (profileError) {
            console.error("Profile update error:", profileError);
            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
        }

        // 5. Mark transaction as successful
        const now = new Date().toISOString();
        await supabase
            .from('transactions')
            .update({
                status: 'success',
                verified_at: now,
                gateway_response: verifyData
            })
            .eq('id', transactionId);

        return NextResponse.json({
            success: true,
            tier: subscriptionTier,
            expiry: expiryDate.toISOString(),
            transactionId
        });
    } catch (error) {
        console.error("Verification error:", error);
        if (transactionId) {
            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('id', transactionId);
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
