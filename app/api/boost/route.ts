import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = "sk_test_2566663f40d9695779ad51331aaa6156f51fe7af";

// Boost pricing (in Naira)
const BOOST_PRICES = {
    '7': 3000,   // 7 days
    '14': 5000,  // 14 days
    '30': 8000   // 30 days
};

export async function POST(request: Request) {
    try {
        const { reference, propertyId, duration } = await request.json();

        if (!reference || !propertyId || !duration) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        // Verify the amount matches the boost price
        const expectedAmount = BOOST_PRICES[duration as keyof typeof BOOST_PRICES] * 100; // kobo
        if (verifyData.data.amount !== expectedAmount) {
            return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
        }

        // Payment successful, update property
        const supabase = await createClient();

        // Calculate featured expiry date
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + parseInt(duration));

        const { error } = await supabase
            .from('properties')
            .update({
                is_featured: true,
                featured_until: featuredUntil.toISOString()
            })
            .eq('id', propertyId);

        if (error) {
            console.error("Database update error:", error);
            return NextResponse.json({ error: "Failed to boost listing" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            featured_until: featuredUntil.toISOString(),
            duration: parseInt(duration)
        });
    } catch (error) {
        console.error("Boost error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
