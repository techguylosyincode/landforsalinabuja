import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY environment variable is not configured");
}

// Boost pricing (in Naira)
const BOOST_PRICES = {
    '7': 3000,   // 7 days
    '14': 5000,  // 14 days
    '30': 8000   // 30 days
};

export async function POST(request: Request) {
    const supabase = await createClient();
    let transactionId: string | null = null;

    try {
        const { reference, propertyId, duration, userId } = await request.json();

        if (!reference || !propertyId || !duration) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get boost price
        const boostPrice = BOOST_PRICES[duration as keyof typeof BOOST_PRICES];
        if (!boostPrice) {
            return NextResponse.json({ error: "Invalid boost duration" }, { status: 400 });
        }

        // Get user ID from property or request
        let finalUserId = userId;
        if (!finalUserId) {
            const { data: property } = await supabase
                .from('properties')
                .select('profiles(id)')
                .eq('id', propertyId)
                .single();
            finalUserId = property?.profiles?.id;
        }

        if (!finalUserId) {
            return NextResponse.json({ error: "Could not determine user ID" }, { status: 400 });
        }

        // 1. Create pending transaction record first
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: finalUserId,
                reference,
                transaction_type: 'boost',
                amount: boostPrice,
                currency: 'NGN',
                property_id: propertyId,
                boost_duration: parseInt(duration),
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
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
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

        if (!verifyData.status || verifyData.data.status !== "success") {
            console.warn("Boost payment verification declined:", verifyData);
            await supabase
                .from('transactions')
                .update({
                    status: 'failed',
                    gateway_response: verifyData
                })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // 3. Verify the amount matches the boost price
        const expectedAmount = boostPrice * 100; // kobo
        if (verifyData.data.amount !== expectedAmount) {
            console.error("Boost amount mismatch. Expected:", expectedAmount, "Got:", verifyData.data.amount);
            await supabase
                .from('transactions')
                .update({
                    status: 'failed',
                    gateway_response: verifyData
                })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
        }

        // 4. Payment successful, update property
        // Calculate featured expiry date
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + parseInt(duration));

        const { error: propError } = await supabase
            .from('properties')
            .update({
                is_featured: true,
                featured_until: featuredUntil.toISOString()
            })
            .eq('id', propertyId);

        if (propError) {
            console.error("Property update error:", propError);
            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('id', transactionId);
            return NextResponse.json({ error: "Failed to boost listing" }, { status: 500 });
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
            featured_until: featuredUntil.toISOString(),
            duration: parseInt(duration),
            transactionId
        });
    } catch (error) {
        console.error("Boost error:", error);
        if (transactionId) {
            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('id', transactionId);
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
