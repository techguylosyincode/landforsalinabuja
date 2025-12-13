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
        const { error } = await supabase
            .from("profiles")
            .upsert({
                id,
                full_name: full_name ?? "",
                phone_number: phone_number ?? "",
                agency_name: agency_name ?? null,
                role: role ?? "user",
                subscription_tier: "starter",
                is_verified: false,
                verification_status: "unverified",
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Admin profile upsert error:", error);
            return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Profile create route error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
