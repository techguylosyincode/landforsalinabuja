import { createClient } from "@/lib/supabase/server";
import BuyPageClient from "./BuyPageClient";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search Land for Sale in Abuja | Filter by District & Price",
    description: "Search for land in Abuja by district, price, size, and title type. Find the perfect plot in Maitama, Asokoro, Guzape, and more.",
};

// Server Component - fetches data on the server
export default async function BuyPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('properties')
        .select('id, title, price, district, size_sqm, images, title_type, slug, is_featured, status')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

    // Apply search term
    const searchTerm = typeof params.q === 'string' ? params.q : '';
    if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`);
    }

    // Apply district filter
    const district = typeof params.district === 'string' ? params.district : '';
    if (district) {
        query = query.ilike('district', `%${district}%`);
    }

    // Apply title type filter
    const titleType = typeof params.titleType === 'string' ? params.titleType : '';
    if (titleType) {
        query = query.eq('title_type', titleType);
    }

    // Apply price range
    const priceRange = typeof params.priceRange === 'string' ? params.priceRange : '';
    const minPriceParam = typeof params.minPrice === 'string' ? params.minPrice : '';
    const maxPriceParam = typeof params.maxPrice === 'string' ? params.maxPrice : '';

    let minPrice = minPriceParam;
    let maxPrice = maxPriceParam;

    if (priceRange) {
        const [rangeMin, rangeMax] = priceRange.split("-");
        minPrice = rangeMin;
        maxPrice = rangeMax;
    }

    if (minPrice) {
        query = query.gte('price', parseInt(minPrice));
    }
    if (maxPrice) {
        query = query.lte('price', parseInt(maxPrice));
    }

    // Apply size range
    const minSize = typeof params.minSize === 'string' ? params.minSize : '';
    const maxSize = typeof params.maxSize === 'string' ? params.maxSize : '';

    if (minSize) {
        query = query.gte('size_sqm', parseInt(minSize));
    }
    if (maxSize) {
        query = query.lte('size_sqm', parseInt(maxSize));
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching properties:", error);
    }

    // Map to property format
    const properties = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        district: p.district,
        size: p.size_sqm,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        titleType: p.title_type,
        slug: p.slug || p.id
    }));

    // Pass initial data and params to client component
    return (
        <BuyPageClient
            initialProperties={properties}
            initialSearchTerm={searchTerm}
            initialDistrict={district}
            initialTitleType={titleType}
            initialPriceRange={priceRange}
            initialMinPrice={minPriceParam}
            initialMaxPrice={maxPriceParam}
            initialMinSize={minSize}
            initialMaxSize={maxSize}
        />
    );
}
