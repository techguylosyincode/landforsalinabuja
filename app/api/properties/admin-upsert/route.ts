import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin/service upsert for properties (bypasses RLS).
 * Expects JSON with property fields; requires SUPABASE_SERVICE_KEY.
 */
export async function POST(req: Request) {
    try {
        const supabase = createAdminClient();
        const body = await req.json();
        if (!body.agent_id) {
            return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
        }

        const { error } = await supabase.from("properties").upsert(body, { onConflict: "slug" });
        if (error) {
            console.error("Admin upsert error:", error);
            return NextResponse.json({ error: "Failed to upsert property" }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Admin upsert route error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
