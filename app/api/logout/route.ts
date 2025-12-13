import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
            return NextResponse.json({ error: "logout_failed" }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Logout unexpected error:", err);
        return NextResponse.json({ error: "logout_failed" }, { status: 500 });
    }
}
