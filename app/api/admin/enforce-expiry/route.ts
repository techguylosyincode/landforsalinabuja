import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron-friendly endpoint to downgrade expired subscriptions
 * and unpublish extra active listings (keep 1 active).
 *
 * Protect with CRON_SECRET env; call with header x-cron-secret.
 */
export async function GET(request: Request) {
    try {
        const secret = process.env.CRON_SECRET;
        const headerSecret = request.headers.get("x-cron-secret");
        if (!secret || secret !== headerSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createAdminClient();
        const nowIso = new Date().toISOString();

        // Find expired profiles
        const { data: expiredProfiles, error: expiredError } = await supabase
            .from("profiles")
            .select("id")
            .lt("subscription_expiry", nowIso);

        if (expiredError) {
            console.error("Expired query error:", expiredError);
            return NextResponse.json({ error: "Failed to query expired profiles" }, { status: 500 });
        }

        if (!expiredProfiles || expiredProfiles.length === 0) {
            return NextResponse.json({ message: "No expired profiles" }, { status: 200 });
        }

        const expiredIds = expiredProfiles.map((p) => p.id);

        // Downgrade to starter and clear expiry
        const { error: downgradeError } = await supabase
            .from("profiles")
            .update({
                subscription_tier: "starter",
                subscription_expiry: null,
            })
            .in("id", expiredIds);

        if (downgradeError) {
            console.error("Downgrade error:", downgradeError);
            return NextResponse.json({ error: "Failed to downgrade profiles" }, { status: 500 });
        }

        let totalUnpublished = 0;

        // For each expired user, keep 1 active listing, unpublish the rest
        for (const userId of expiredIds) {
            const { data: props, error: propError } = await supabase
                .from("properties")
                .select("id, updated_at, created_at")
                .eq("agent_id", userId)
                .eq("status", "active")
                .order("updated_at", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false });

            if (propError) {
                console.error("Property fetch error for user", userId, propError);
                continue;
            }

            if (!props || props.length <= 1) continue;

            const toUnpublish = props.slice(1).map((p) => p.id);
            const { error: unpubError } = await supabase
                .from("properties")
                .update({ status: "pending", is_featured: false, featured_until: null })
                .in("id", toUnpublish);

            if (unpubError) {
                console.error("Unpublish error for user", userId, unpubError);
            } else {
                totalUnpublished += toUnpublish.length;
            }
        }

        return NextResponse.json({
            message: "Expiry enforcement complete",
            expiredCount: expiredIds.length,
            unpublishedCount: totalUnpublished,
        });
    } catch (err) {
        console.error("Enforce expiry failed:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
