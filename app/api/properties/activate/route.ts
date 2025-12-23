import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LISTING_LIMITS } from "@/lib/constants/subscription";

/**
 * Server-side activation guard.
 * Expects JSON: { propertyId: string, userId: string }
 * Enforces active listing limits by subscription tier and checks expiry.
 */
export async function POST(req: Request) {
    try {
        const supabase = createAdminClient();
        const body = await req.json();
        const { propertyId, userId } = body || {};

        if (!propertyId || !userId) {
            return NextResponse.json({ error: "Missing propertyId or userId" }, { status: 400 });
        }

        // Fetch profile to determine effective tier
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("subscription_tier, subscription_expiry, verification_status, is_verified")
            .eq("id", userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const expiry = profile.subscription_expiry ? new Date(profile.subscription_expiry) : null;
        const tierExpired = expiry && expiry.getTime() < Date.now();
        const tier = tierExpired ? "starter" : profile.subscription_tier || "starter";

        const limit = LISTING_LIMITS[tier as keyof typeof LISTING_LIMITS] ?? 1;

        if (limit > 0) {
            const { count, error: countError } = await supabase
                .from("properties")
                .select("*", { count: "exact", head: true })
                .eq("agent_id", userId)
                .eq("status", "active");

            if (countError) {
                return NextResponse.json({ error: "Failed to check active listings" }, { status: 500 });
            }

            if (count !== null && count >= limit) {
                const tierName = tier === "starter" || tier === "free" ? "Starter" : "Pro";
                return NextResponse.json({
                    error: `${tierName} plan limit reached. You can only have ${limit} active listing${limit > 1 ? "s" : ""}.`,
                }, { status: 403 });
            }
        }

        // Optional: if not verified and not paid, keep pending
        const isPaid = tier === "premium" || tier === "pro" || tier === "agency";
        const isVerified = profile.verification_status === "verified" || profile.is_verified;
        const status = isPaid && isVerified ? "active" : "pending";

        const { error: updateError } = await supabase
            .from("properties")
            .update({ status, is_featured: status === "active" ? null : false, featured_until: status === "active" ? null : null })
            .eq("id", propertyId)
            .eq("agent_id", userId);

        if (updateError) {
            return NextResponse.json({ error: "Failed to update listing status" }, { status: 500 });
        }

        return NextResponse.json({ status }, { status: 200 });
    } catch (err) {
        console.error("Activation error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
