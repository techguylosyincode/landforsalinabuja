import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const offset = (page - 1) * limit;

    try {
        const supabase = await createClient();
        const now = new Date().toISOString();

        // Get properties with pagination
        const { data, error } = await supabase
            .from("properties")
            .select("id, title, price, size_sqm, district, images, title_type, slug, is_featured, featured_until")
            .or(`is_featured.eq.false,and(is_featured.eq.true,featured_until.gt.${now})`)
            .eq("status", "active")
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching properties:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const properties = (data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            district: p.district,
            size: p.size_sqm || 0,
            image: p.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
            titleType: p.title_type,
            slug: p.slug || p.id,
        }));

        return NextResponse.json({ properties });
    } catch (error) {
        console.error("Properties API error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
