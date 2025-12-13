import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define Property type matching PropertyCard props
type Property = {
    id: string;
    title: string;
    price: number;
    district: string;
    size: number;
    image: string;
    titleType: string;
    slug: string;
};

export const revalidate = 300;

export default async function DistrictPage({ params }: { params: { district: string } }) {
    const districtName = params.district;

    const supabase = await createClient();
    const { data } = await supabase
        .from('properties')
        .select('id, title, price, size_sqm, district, images, title_type, slug')
        .ilike('district', districtName)
        .order('created_at', { ascending: false })
        .limit(24);

    const properties: Property[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        district: p.district,
        size: p.size_sqm || p.size,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        titleType: p.title_type,
        slug: p.slug || p.id
    }));

    // Capitalize district name for display
    const displayDistrict = districtName ? districtName.charAt(0).toUpperCase() + districtName.slice(1) : "";

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link href="/buy" className="inline-flex items-center text-gray-500 hover:text-primary mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Listings
                    </Link>
                    <h1 className="text-3xl font-bold">Land for Sale in {displayDistrict}</h1>
                    <p className="text-gray-600 mt-2">Browse our verified listings in {displayDistrict}, Abuja.</p>
                </div>

                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900">No listings found in {displayDistrict}</h3>
                        <p className="text-gray-500 mt-2">We currently don't have any properties listed in this district.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/buy">View All Areas</Link>
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
