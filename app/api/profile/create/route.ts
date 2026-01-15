import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Create/Upsert a profile using the service role (bypasses RLS).
 * Expects JSON: { id, full_name, phone_number, agency_name, role }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, full_name, phone_number, agency_name, role } = body || {};

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const profilePayload = {
            id,
            full_name: full_name ?? "",
            phone_number: phone_number ?? "",
            agency_name: agency_name ?? null,
            role: role ?? "user",
            email_verified: false,
            payment_required: false,  // Freemium: no payment required for 1 free listing
            subscription_tier: 'starter',  // Start with free tier (1 listing)
            subscription_expiry: null,  // Starter tier never expires
        };

        const { error } = await supabase
            .from("profiles")
            .upsert(profilePayload, { onConflict: "id" });

        if (error) {
            console.error("Admin profile upsert error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
            return NextResponse.json(
                {
                    error: "Failed to create profile",
                    details: error.message,
                    code: error.code,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Profile create route error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
