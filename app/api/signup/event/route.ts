import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            event_type,
            email,
            role_selected,
            user_id,
            source_path,
        } = body || {};

        if (!event_type) {
            return NextResponse.json({ error: "event_type required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase.from("signup_events").insert({
            event_type,
            email: email || null,
            role_selected: role_selected || null,
            user_id: user_id || null,
            source_path: source_path || null,
        });

        if (error) {
            console.error("signup_events insert error:", error);
            return NextResponse.json({ error: "insert failed" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("signup event error:", err);
        return NextResponse.json({ error: "server error" }, { status: 500 });
    }
}
