"use client";

import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function DistrictPage() {
    const params = useParams();
    const districtName = params.district as string;

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            const supabase = createClient();

            // Fetch properties where district matches (case insensitive)
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .ilike('district', districtName)
                .order('created_at', { ascending: false });

            if (data) {
                const mappedProps: Property[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    district: p.district,
                    size: p.size_sqm || p.size, // Handle both naming conventions if inconsistent
                    image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
                    titleType: p.title_type,
                    slug: p.slug || p.id
                }));
                setProperties(mappedProps);
            }
            setLoading(false);
        };

        if (districtName) {
            fetchProperties();
        }
    }, [districtName]);

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

                {loading ? (
                    <div className="text-center py-20">Loading properties in {displayDistrict}...</div>
                ) : properties.length > 0 ? (
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
